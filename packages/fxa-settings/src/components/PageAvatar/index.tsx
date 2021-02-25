/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { Localized, useLocalization } from '@fluent/react';
import Webcam from 'react-webcam';
import Cropper from 'react-easy-crop';
import { Slider } from '@material-ui/core';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import 'react-easy-crop/react-easy-crop.css';

import { cache, sessionToken } from '../../lib/cache';
import { isMobileDevice } from '../../lib/utilities';
import { useAccount } from '../../models';
import { HomePath } from '../../constants';
import firefox from '../../lib/firefox';
import { useAvatarUploader } from '../../lib/auth';
import { onFileChange } from '../../lib/file-utils';
import { getCroppedImg } from '../../lib/canvas-utils';
import { useAlertBar } from '../../lib/hooks';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../lib/metrics';

import AlertBar from '../AlertBar';
import Avatar from '../Avatar';
import FlowContainer from '../FlowContainer';
import {
  AddPhotoBtn,
  ConfirmBtns,
  RemovePhotoBtn,
  RotateBtn,
  TakePhotoBtn,
  ZoomInBtn,
  ZoomOutBtn,
} from './buttons';

const PROFILE_FILE_IMAGE_MAX_UPLOAD_SIZE = 2 * 1024 * 1024;
const frameClass = `rounded-full m-auto w-40 object-cover`;

export const PageAddAvatar = (_: RouteComponentProps) => {
  usePageViewEvent('settings.avatar.change');
  const navigate = useNavigate();
  const account = useAccount();
  const { l10n } = useLocalization();
  const { avatar } = useAccount();
  const alertBar = useAlertBar();
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [saveStringId, setSaveStringId] = useState('avatar-page-save-button');

  const uploadAvatar = useAvatarUploader({
    onSuccess: (newAvatar) => {
      logViewEvent(settingsViewName, 'avatar.crop.submit.change');
      firefox.profileChanged(account.uid);
      cache.modify({
        id: cache.identify({ __typename: 'Account' }),
        fields: {
          avatar() {
            return newAvatar;
          },
        },
      });
      navigate(HomePath + '#profile-picture', { replace: true });
    },
    onError: onFileError,
  });

  /* Capture State */

  const webcamRef = useRef<Webcam>(null);
  const [capturedImgSrc, setCapturedImgSrc] = useState<undefined | string>(
    undefined
  );
  const [camLoaded, setCamLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  /* Edit State */

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedImgSrc, setCroppedImgSrc] = useState<null | Blob>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const resetAllState = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setCroppedImgSrc(null);
    setCapturedImgSrc(undefined);
    setSaveEnabled(false);
  }, [
    setZoom,
    setRotation,
    setCrop,
    setCroppedImgSrc,
    setCapturedImgSrc,
    setSaveEnabled,
  ]);

  /* Edit Handlers */

  const onCropComplete = useCallback(
    (_croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
      setSaveEnabled(true);
    },
    [setCroppedAreaPixels]
  );

  const saveCroppedImage = useCallback(async () => {
    try {
      if (capturedImgSrc && croppedAreaPixels) {
        return await getCroppedImg(capturedImgSrc, croppedAreaPixels, rotation);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [croppedAreaPixels, rotation, capturedImgSrc]);

  const handleSliderChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: number | number[]
  ) => {
    // @ts-ignore
    setZoom(value);
  };

  /* Capture Handlers */

  const capture = useCallback(async () => {
    const webcam: any = webcamRef?.current;
    const screenshot = await webcam.getScreenshot();
    const cropped = await getCroppedImg(screenshot, {
      width: 720,
      height: 720,
      x: 290,
      y: 0,
    });
    setCroppedImgSrc(cropped);
    setCapturing(false);
    setSaveEnabled(true);
  }, [webcamRef, setCroppedImgSrc, setCapturing]);

  const onMediaLoad = useCallback(() => {
    setTimeout(() => {
      setCamLoaded(true);
    }, 400);
  }, [setCamLoaded]);

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  /* General Handlers */

  const save = useCallback(async () => {
    setSaveEnabled(false);
    const img = croppedImgSrc || (await saveCroppedImage());
    if (img && img.size > PROFILE_FILE_IMAGE_MAX_UPLOAD_SIZE) {
      alertBar.error(l10n.getString('avatar-page-image-too-large-error'));
      resetAllState();
    } else if (img) {
      setSaveStringId('avatar-page-saving-button');
      uploadAvatar.execute(sessionToken()!, img);
    }
  }, [
    alertBar,
    croppedImgSrc,
    l10n,
    saveCroppedImage,
    setSaveEnabled,
    setSaveStringId,
    uploadAvatar,
    resetAllState,
  ]);

  function onFileError() {
    alertBar.error(l10n.getString('avatar-page-file-upload-error-2'));
  }

  function onMediaError() {
    alertBar.error(l10n.getString('avatar-page-camera-error'));
  }

  /* Elements */
  const confirmBtns = (
    <ConfirmBtns
      onSave={save}
      saveEnabled={!capturing && saveEnabled}
      saveStringId={saveStringId}
    />
  );

  const editView = (
    <div className="AvatarCropper flex flex-col">
      <div className="relative w-64 h-48 mx-auto my-4">
        <Cropper
          image={capturedImgSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          showGrid={false}
          cropShape="round"
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          disableAutomaticStylesInjection={true}
          cropSize={{ width: 160, height: 160 }}
          style={{ containerStyle: { borderRadius: '8px' } }}
        />
      </div>
      <div className="flex justify-center m-2 rtl:flex-row-reverse">
        <ZoomOutBtn
          onClick={() => {
            if (zoom === 1) return;
            return setZoom(zoom - 0.1);
          }}
        />
        <div className="w-32 ml-2 mr-4">
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            className={'w-100'}
            aria-label="zoom-slider"
            component={'span'}
            onChange={handleSliderChange}
          />
        </div>
        <ZoomInBtn
          onClick={() => {
            return setZoom(zoom + 0.1);
          }}
        />
        <RotateBtn
          onClick={() => {
            if (rotation < 315) {
              return setRotation(rotation + 45);
            } else {
              return setRotation(0);
            }
          }}
        />
      </div>
    </div>
  );

  const captureView = (
    <div className="p-2">
      {mediaError && <Avatar className="mx-auto w-40" />}
      <>
        <LoadingSpinner
          className={`bg-grey-20 flex items-center flex-col justify-center select-none ${
            camLoaded || mediaError ? 'invisible h-0' : 'visible h-40'
          }`}
        />
        <Webcam
          className={`${frameClass} ${
            camLoaded ? 'visible h-40' : 'invisible h-0'
          }`}
          audio={false}
          ref={webcamRef}
          forceScreenshotSourceSize
          videoConstraints={{
            height: 720,
            width: 720,
          }}
          screenshotFormat="image/jpeg"
          screenshotQuality={1}
          onUserMedia={onMediaLoad}
          onUserMediaError={() => {
            onMediaError();
            setMediaError(true);
          }}
        />
      </>
    </div>
  );

  const avatarPreview = croppedImgSrc ? (
    <Localized id="avatar-page-new-avatar" attrs={{ alt: true }}>
      <img
        src={URL.createObjectURL(croppedImgSrc)}
        className={`${frameClass} h-40`}
        alt="new avatar"
      />
    </Localized>
  ) : (
    <Avatar className="mx-auto w-40" />
  );

  return (
    <Localized id="avatar-page-title" attrs={{ title: true }}>
      <FlowContainer title="Profile picture">
        {alertBar.visible && (
          <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
            <p data-testid="update-avatar-error">{alertBar.content}</p>
          </AlertBar>
        )}
        <form onSubmit={handleSubmit} className="mt-4">
          {capturedImgSrc && !croppedImgSrc ? (
            <>
              {editView}
              {confirmBtns}
            </>
          ) : (
            <>
              {capturing ? captureView : avatarPreview}
              <div className="flex text-center text-xs justify-around max-w-xs my-4 mx-12 mobileLandscape:mx-24">
                {!capturing && (
                  <AddPhotoBtn
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      resetAllState();
                      onFileChange(event, setCapturedImgSrc, onFileError);
                    }}
                  />
                )}
                {!mediaError && !isMobileDevice() && (
                  <TakePhotoBtn
                    capturing={capturing}
                    onClick={() => {
                      capturing ? capture() : setCapturing(true);
                    }}
                  />
                )}
                {avatar.url && !capturing && <RemovePhotoBtn />}
              </div>
              {confirmBtns}
            </>
          )}
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageAddAvatar;

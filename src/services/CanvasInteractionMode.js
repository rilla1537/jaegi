// ModeDispatcher.js
import { init as initDrawableRulerMode }  from './modes/DrawableRulerMode';
import { init as initDrawableTargetMode } from './modes/DrawableTargetMode';
import { init as initDetectShapeMode }    from './modes/DetectShape';
import { init as initSelectedShapeMode }   from './modes/SelectedShape'; 

// ModeDispatcher.js
export default {
  from(world, cb) {
    let onDown    = () => {};
    let onMove    = () => {};
    let onUp      = () => {};
    let onWheel   = () => {};
    let onKeyDown = () => {};

    const publicInterface = {
      set(modeName, params = {}) {
        const initFn = {
          DrawableRulerMode:  initDrawableRulerMode,
          DrawableTargetMode: initDrawableTargetMode,
          DetectShapeMode:    initDetectShapeMode,
          SelectedShapeMode:  initSelectedShapeMode,
        }[modeName];

        if (!initFn) {
          console.warn(`'${modeName}' 모드를 찾을 수 없습니다.`);
          return;
        }

        // ① init 에만 params 전달
        const mode = initFn(world, publicInterface, params);

        onDown    = mode.onDown    || (() => {});
        onMove    = mode.onMove    || (() => {});
        onUp      = mode.onUp      || (() => {});
        onWheel   = mode.onWheel   || (() => {});
        onKeyDown = mode.onKeyDown || (() => {});

        // ② cb에는 기존대로 modeName만
        cb(modeName);
      },

      onDown:    e => onDown(e),
      onMove:    e => onMove(e),
      onUp:      e => onUp(e),
      onWheel:   e => onWheel(e),
      onKeyDown: e => onKeyDown(e),
    };

    return publicInterface;
  }
};

import { sound } from '../services/sound';

export function useHaptics() {
  const playTap = () => sound.playTap();
  const playSuccess = () => sound.playSuccess();
  const playError = () => sound.playError();

  return {
    playTap,
    playSuccess,
    playError
  };
}

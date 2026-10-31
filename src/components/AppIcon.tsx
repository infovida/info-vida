import { Image } from 'react-native';

import { colors } from '../theme/tokens';

const icons = {
  home: { normal: require('../../assets/icons/home.png'), active: require('../../assets/icons/home-active.png') },
  quiz: { normal: require('../../assets/icons/quiz.png'), active: require('../../assets/icons/quiz-active.png') },
  reminders: { normal: require('../../assets/icons/reminders.png'), active: require('../../assets/icons/reminders-active.png') },
  emergency: { normal: require('../../assets/icons/emergency.png'), active: require('../../assets/icons/emergency-active.png') },
  profile: { normal: require('../../assets/icons/profile.png'), active: require('../../assets/icons/profile-active.png') },
  check: { normal: require('../../assets/icons/check.png'), active: require('../../assets/icons/check-active.png') },
  close: { normal: require('../../assets/icons/close.png'), active: require('../../assets/icons/close-active.png') },
  info: { normal: require('../../assets/icons/info.png'), active: require('../../assets/icons/info-active.png') },
  arrow: { normal: require('../../assets/icons/arrow.png'), active: require('../../assets/icons/arrow-active.png') },
  plus: { normal: require('../../assets/icons/plus.png'), active: require('../../assets/icons/plus-active.png') },
  flame: { normal: require('../../assets/icons/flame.png'), active: require('../../assets/icons/flame-active.png') },
  health: { normal: require('../../assets/icons/health.png'), active: require('../../assets/icons/health-active.png') },
  vaccination: { normal: require('../../assets/icons/vaccination.png'), active: require('../../assets/icons/vaccination-active.png') },
  prevention: { normal: require('../../assets/icons/prevention.png'), active: require('../../assets/icons/prevention-active.png') },
  misinformation: { normal: require('../../assets/icons/misinformation.png'), active: require('../../assets/icons/misinformation-active.png') },
  nutrition: { normal: require('../../assets/icons/nutrition.png'), active: require('../../assets/icons/nutrition-active.png') },
  exercise: { normal: require('../../assets/icons/exercise.png'), active: require('../../assets/icons/exercise-active.png') },
  childhood: { normal: require('../../assets/icons/childhood.png'), active: require('../../assets/icons/childhood-active.png') },
  trending: { normal: require('../../assets/icons/trending.png'), active: require('../../assets/icons/trending-active.png') },
  forward: { normal: require('../../assets/icons/forward.png'), active: require('../../assets/icons/forward-active.png') },
  trophy: { normal: require('../../assets/icons/trophy.png'), active: require('../../assets/icons/trophy-active.png') },
  shuffle: { normal: require('../../assets/icons/shuffle.png'), active: require('../../assets/icons/shuffle-active.png') },
  pill: { normal: require('../../assets/icons/pill.png'), active: require('../../assets/icons/pill-active.png') },
  bellOff: { normal: require('../../assets/icons/bell-off.png'), active: require('../../assets/icons/bell-off-active.png') },
  warning: { normal: require('../../assets/icons/warning.png'), active: require('../../assets/icons/warning-active.png') },
  checkCircle: { normal: require('../../assets/icons/check-circle.png'), active: require('../../assets/icons/check-circle-active.png') },
  clock: { normal: require('../../assets/icons/clock.png'), active: require('../../assets/icons/clock-active.png') },
  alarm: { normal: require('../../assets/icons/alarm.png'), active: require('../../assets/icons/alarm-active.png') },
  trash: { normal: require('../../assets/icons/trash.png'), active: require('../../assets/icons/trash-active.png') },
  edit: { normal: require('../../assets/icons/edit.png'), active: require('../../assets/icons/edit-active.png') },
} as const;
export type IconName = keyof typeof icons;

/** Local exports of the original Lucide artwork; tinting preserves its line style. */
export function AppIcon({ name, size = 24, color = colors.primary, active = false }: {
  name: IconName; size?: number; color?: string; active?: boolean;
}) {
  return <Image accessible={false} importantForAccessibility="no" resizeMode="contain"
    source={active ? icons[name].active : icons[name].normal}
    style={{ width: size, height: size, tintColor: color }} />;
}

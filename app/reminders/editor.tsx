import { useLocalSearchParams } from 'expo-router';

import { ReminderEditorScreen } from '../../src/features/reminders/ReminderEditorScreen';

export default function ReminderEditorRoute() {
  const { id, preset } = useLocalSearchParams<{ id?: string | string[]; preset?: string | string[] }>();
  return (
    <ReminderEditorScreen
      reminderId={typeof id === 'string' ? id : undefined}
      preset={typeof preset === 'string' ? preset : undefined}
    />
  );
}

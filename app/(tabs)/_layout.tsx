import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { StyleSheet } from 'react-native';

import { AppTabBar } from '../../src/navigation/AppTabBar';
import { appTabs } from '../../src/navigation/tabs';
import { TabButton } from '../../src/navigation/TabButton';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  return <Tabs style={styles.root} options={{ backBehavior: 'history' }}>
    <TabSlot style={styles.slot} />
    <TabList asChild><AppTabBar>
      {appTabs.map(tab => <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
        <TabButton label={tab.label} icon={tab.icon} />
      </TabTrigger>)}
    </AppTabBar></TabList>
  </Tabs>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background }, slot: { flex: 1 },
});

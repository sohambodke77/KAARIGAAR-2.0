import { StyleSheet, View } from 'react-native';

import { Avatar } from './Avatar';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

interface ScreenHeaderProps {
  onProfile: () => void;
}

export function ScreenHeader({ onProfile }: ScreenHeaderProps) {
  const { user } = useAuth();
  const label = user?.identifier === 'Google account' ? 'User' : (user?.identifier ?? 'K');

  return (
    <View style={styles.row}>
      <Logo size="sm" />
      <Avatar label={label} onPress={onProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
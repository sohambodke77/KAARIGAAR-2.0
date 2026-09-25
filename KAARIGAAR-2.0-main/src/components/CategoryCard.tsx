import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Category } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

interface CategoryCardProps {
  category: Category;
  isActive?: boolean;
}

export function CategoryCard({ category, isActive = false }: CategoryCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const handlePress = () => {
    navigation.navigate('Category', {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.containerActive,
        pressed && styles.containerPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${category.name}`}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: category.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.name, isActive && styles.nameActive]} numberOfLines={1}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 104,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        } as never)
      : {}),
  },
  containerActive: {
    borderColor: colors.gold,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
  },
  containerPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  imageWrapper: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.marketplaceBg,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  nameActive: {
    fontFamily: fonts.sans.semibold,
    color: colors.goldDeep,
  },
});

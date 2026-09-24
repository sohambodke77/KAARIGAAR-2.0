import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { fonts, light } from '../theme';

interface Message {
  id: string;
  from: 'customer' | 'creator';
  text: string;
  at: number;
}

interface Thread {
  id: string;
  customer: string;
  preview: string;
  unread: number;
}

const THREADS: Thread[] = [
  { id: 't1', customer: 'Aarav Mehta', preview: 'Can I get the wall hanging in teal?', unread: 2 },
  { id: 't2', customer: 'Diya Sharma', preview: 'Order ORD-DEMO2 — when will it ship?', unread: 1 },
  { id: 't3', customer: 'Kabir Singh', preview: 'Loved the piece, thank you!', unread: 0 },
];

const SEED: Record<string, Message[]> = {
  t1: [
    { id: 'm1', from: 'customer', text: 'Hi! Is the macramé wall hanging available in teal?', at: Date.now() - 3600_000 },
    { id: 'm2', from: 'creator', text: 'Yes — I can custom-dye it in teal for you.', at: Date.now() - 3000_000 },
  ],
  t2: [
    { id: 'm3', from: 'customer', text: 'When will order ORD-DEMO2 ship?', at: Date.now() - 86_400_000 },
  ],
  t3: [
    { id: 'm4', from: 'customer', text: 'Loved the piece, thank you!', at: Date.now() - 172_800_000 },
  ],
};

const STORAGE_KEY = '@kaarigaar/messages';

export function CreatorMessagesScreen() {
  const [store, setStore] = useState<Record<string, Message[]>>(SEED);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setStore({ ...SEED, ...JSON.parse(raw) }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeId) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)).catch(() => {});
  }, [store, activeId]);

  const send = () => {
    if (!draft.trim() || !activeId) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      from: 'creator',
      text: draft.trim(),
      at: Date.now(),
    };
    setStore((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), msg] }));
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const activeThread = THREADS.find((t) => t.id === activeId);

  if (activeThread) {
    const messages = store[activeThread.id] ?? [];
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <PageHeader
          title={activeThread.customer}
          fallback={() => setActiveId(null)}
          right={<Avatar label={activeThread.customer} size={36} />}
        />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.chatWrap}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.from === 'creator' ? styles.bubbleCreator : styles.bubbleCustomer,
                ]}
              >
                <Text style={[styles.bubbleText, item.from === 'creator' && styles.bubbleTextCreator]}>
                  {item.text}
                </Text>
              </View>
            )}
          />
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a message…"
              placeholderTextColor={light.inkFaint}
              style={[styles.composerInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as never)]}
              selectionColor="#A9823A"
              returnKeyType="send"
              onSubmitEditing={send}
            />
            <Pressable onPress={send} style={styles.sendBtn} accessibilityRole="button" accessibilityLabel="Send message">
              <Ionicons name="send" size={17} color="#2A1A10" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Messages" subtitle={`${THREADS.length} conversations`} />
      <FlatList
        data={THREADS}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.threadWrap}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setActiveId(item.id)}
            style={({ pressed }) => [styles.threadRow, pressed && { backgroundColor: light.surfaceAlt }]}
          >
            <Avatar label={item.customer} size={46} />
            <View style={styles.threadInfo}>
              <View style={styles.threadTop}>
                <Text style={styles.threadName}>{item.customer}</Text>
                {store[item.id]?.length ? (
                  <Text style={styles.threadTime}>
                    {new Date(store[item.id][store[item.id].length - 1].at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                ) : null}
              </View>
              <View style={styles.threadBottom}>
                <Text style={styles.threadPreview} numberOfLines={1}>
                  {(store[item.id]?.[store[item.id].length - 1]?.text) ?? item.preview}
                </Text>
                {item.unread > 0 ? (
                  <View style={styles.unread}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  flex: { flex: 1 },
  threadWrap: { padding: 16, paddingBottom: 32, gap: 4 },
  threadRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: light.surface,
    borderWidth: 1,
    borderColor: light.line,
    marginBottom: 8,
  },
  threadInfo: { flex: 1, gap: 3 },
  threadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
  },
  threadTime: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11,
  },
  threadBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  threadPreview: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    flex: 1,
  },
  unread: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: '#D9A94A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#2A1A10',
    fontFamily: fonts.sans.bold,
    fontSize: 11,
  },
  chatWrap: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 4,
  },
  bubbleCustomer: {
    alignSelf: 'flex-start',
    backgroundColor: light.surface,
    borderWidth: 1,
    borderColor: light.line,
    borderBottomLeftRadius: 6,
  },
  bubbleCreator: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(212,163,89,0.28)',
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    color: light.ink,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  bubbleTextCreator: { color: '#2A1A10' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: light.line,
    backgroundColor: light.surface,
  },
  composerInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: light.bg,
    borderWidth: 1,
    borderColor: light.line,
    color: light.ink,
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D9A94A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
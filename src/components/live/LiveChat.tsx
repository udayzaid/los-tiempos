import { LiveTheme } from '@/constants/live-theme';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChatMessage, ChatMessageData } from './ChatMessage';

// TODO: reemplazar este estado local por datos reales:
// - conexión WebSocket para recibir mensajes en tiempo real
// - envío del mensaje a la API/backend en vez de solo agregarlo local
const MOCK_MESSAGES: ChatMessageData[] = [
  { id: '1', username: '@mercedesnunez9731', text: 'En el Perú pasa de todo ahi viene la trafa' },
  { id: '2', username: '@Lun_wint', text: 'hasta en roblox se organizaron mejor' },
  { id: '3', username: '@sokarita0528', text: 'Nos gustaría saber quiénes son los dueños de esta compañía...' },
];

export function LiveChat() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [draft, setDraft] = useState('');

  function handleSend() {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), username: 'Tú', text: draft.trim() },
    ]);
    setDraft('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>CHAT EN VIVO</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage {...item} />}
        style={styles.list}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Lorem ipsum dolor sit amet, con..."
          placeholderTextColor={LiveTheme.textMuted}
          style={styles.input}
          onSubmitEditing={handleSend}
        />
        <Pressable onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: LiveTheme.chatBorder,
    backgroundColor: LiveTheme.chatBg,
    minHeight: 300,
  },
  header: {
    backgroundColor: LiveTheme.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: LiveTheme.chatBorder,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: LiveTheme.black,
  },
  list: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LiveTheme.gold,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: LiveTheme.black,
  },
  sendButton: {
    paddingHorizontal: 8,
  },
  sendButtonText: {
    fontSize: 16,
    color: LiveTheme.black,
  },
});
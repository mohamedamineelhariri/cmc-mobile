import { useState, useRef } from "react";
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Send, Mic, MicOff, Square } from "lucide-react-native";
import * as Speech from "expo-speech";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  const toggleVoice = () => {
    if (isListening) {
      Speech.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);

    const startSpeech = async () => {
      try {
        await Speech.speak("En écoute...", {
          language: "fr",
          onDone: () => {
            setIsListening(false);
            inputRef.current?.focus();
          },
        });
      } catch {
        setIsListening(false);
      }
    };

    startSpeech();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-row items-center bg-white border-t border-gray-100 px-3 py-2 pb-6 gap-2">
        <TouchableOpacity
          onPress={toggleVoice}
          className={`h-10 w-10 rounded-full items-center justify-center ${
            isListening ? "bg-red-100" : "bg-gray-100"
          }`}
        >
          {isListening ? (
            <MicOff size={20} color="#ef4444" />
          ) : (
            <Mic size={20} color="#6b7280" />
          )}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Posez votre question..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={512}
          className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 text-sm text-gray-800 max-h-24"
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Enter") {
              handleSend();
            }
          }}
        />

        {isLoading ? (
          <TouchableOpacity
            onPress={onStop}
            className="h-10 w-10 rounded-full bg-red-500 items-center justify-center"
          >
            <Square size={18} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || disabled}
            className={`h-10 w-10 rounded-full items-center justify-center ${
              text.trim() ? "bg-cmc-teal" : "bg-gray-200"
            }`}
          >
            <Send size={18} color={text.trim() ? "white" : "#9ca3af"} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

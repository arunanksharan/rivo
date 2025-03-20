import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface HelpItem {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function VoiceAssistantHelpScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const helpItems: HelpItem[] = [
    {
      title: 'Voice Commands',
      description: 'Tap the microphone button and speak clearly. The assistant will listen until you stop speaking or tap the button again.',
      icon: 'mic-outline',
    },
    {
      title: 'Text Input',
      description: 'If you prefer typing, tap "Type Instead" to switch to text input mode. You can switch back to voice mode at any time.',
      icon: 'chatbubble-outline',
    },
    {
      title: 'Property Search',
      description: 'Ask about properties with specific features, locations, or price ranges. For example: "Show me 3-bedroom houses under $500,000 in downtown."',
      icon: 'search-outline',
    },
    {
      title: 'Schedule Viewings',
      description: 'Request to schedule property viewings with specific dates and times. For example: "Schedule a viewing for the modern apartment on Saturday at 2 PM."',
      icon: 'calendar-outline',
    },
    {
      title: 'Save Favorites',
      description: 'Save properties to your favorites list. For example: "Add this property to my favorites" or "Save this listing for later."',
      icon: 'heart-outline',
    },
    {
      title: 'Property Photos',
      description: 'Take photos of properties and add voice annotations. For example: "Take a photo of this kitchen" or "Capture this view."',
      icon: 'camera-outline',
    },
    {
      title: 'Market Information',
      description: 'Ask about real estate market trends, property values, or neighborhood information. For example: "What\'s the market trend in this area?"',
      icon: 'trending-up-outline',
    },
    {
      title: 'Compare Properties',
      description: 'Compare features, prices, or locations of different properties. For example: "Compare these two properties" or "Which property has better value?"',
      icon: 'git-compare-outline',
    },
    {
      title: 'Reminders',
      description: 'Set reminders for open houses, viewings, or follow-ups. For example: "Remind me about the open house on Sunday at 3 PM."',
      icon: 'notifications-outline',
    },
    {
      title: 'Navigation',
      description: 'Get directions to properties or navigate to different parts of the app. For example: "Show me the map view" or "Take me to my saved searches."',
      icon: 'navigate-outline',
    },
  ];

  const renderHelpItem = (item: HelpItem, index: number) => (
    <Card key={index} style={styles.helpCard}>
      <View style={styles.helpIconContainer}>
        <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.helpTextContainer}>
        <Text variant="subtitle1" style={styles.helpTitle}>{item.title}</Text>
        <Text variant="body2" color={theme.colors.textLight} style={styles.helpDescription}>
          {item.description}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="h4">Voice Assistant Help</Text>
        <Text variant="body2" color={theme.colors.textLight}>
          Learn how to use the voice assistant
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="subtitle1" style={styles.sectionTitle}>
          Getting Started
        </Text>
        <Card style={styles.introCard}>
          <Text variant="body2">
            The voice assistant helps you find properties, schedule viewings, and manage your real estate journey using natural voice commands or text input.
          </Text>
        </Card>

        <Text variant="subtitle1" style={styles.sectionTitle}>
          Available Features
        </Text>
        {helpItems.map(renderHelpItem)}

        <Text variant="subtitle1" style={styles.sectionTitle}>
          Tips for Best Results
        </Text>
        <Card style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
            <Text variant="body2" style={styles.tipText}>
              Speak clearly and at a normal pace
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
            <Text variant="body2" style={styles.tipText}>
              Use specific details in your requests
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
            <Text variant="body2" style={styles.tipText}>
              Try the suggested commands for examples
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
            <Text variant="body2" style={styles.tipText}>
              Switch to text input in noisy environments
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Return to Voice Assistant"
          variant="primary"
          onPress={() => router.back()}
          leftIcon={<Ionicons name="arrow-back-outline" size={20} color={theme.colors.white} />}
          style={styles.backButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  introCard: {
    padding: 16,
  },
  helpCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
  },
  helpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    marginBottom: 4,
  },
  helpDescription: {
    lineHeight: 20,
  },
  tipsCard: {
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    width: '100%',
  },
});

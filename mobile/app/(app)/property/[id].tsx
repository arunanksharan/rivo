import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { logger } from '@/utils/logger';
import { Property, PropertyType } from '@/types/property';

// Mock data for property details
const PROPERTY_DATA = {
  '1': {
    id: '1',
    title: 'Modern Apartment in Downtown',
    address: '123 Main St, New York, NY',
    price: '$2,500,000',
    description:
      'This stunning modern apartment offers breathtaking views of the city skyline. Located in the heart of downtown, it features high-end finishes, an open floor plan, and floor-to-ceiling windows that flood the space with natural light. The gourmet kitchen is equipped with top-of-the-line appliances and a large island perfect for entertaining. The primary suite includes a spa-like bathroom with a soaking tub and a walk-in closet.',
    beds: 3,
    baths: 2,
    area: '1,200 sqft',
    yearBuilt: 2018,
    type: 'Apartment',
    parkingSpots: 1,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=500&auto=format&q=80',
    ],
    features: [
      'Central Air Conditioning',
      'In-unit Laundry',
      'Hardwood Floors',
      'Stainless Steel Appliances',
      'Granite Countertops',
      'Walk-in Closet',
      'Fitness Center',
      'Rooftop Terrace',
      'Concierge Service',
      '24-hour Security',
    ],
    agent: {
      name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@example.com',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&q=80',
    },
    location: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  '2': {
    id: '2',
    title: 'Luxury Villa with Pool',
    address: '456 Ocean Ave, Miami, FL',
    price: '$4,800,000',
    description:
      'Experience the epitome of luxury living in this stunning waterfront villa. This exquisite property features an open floor plan with soaring ceilings, floor-to-ceiling windows, and sliding glass doors that lead to a spacious patio with an infinity pool overlooking the ocean. The gourmet kitchen is equipped with high-end appliances, custom cabinetry, and a large island. The primary suite includes a spa-like bathroom with a soaking tub and a walk-in closet.',
    beds: 5,
    baths: 4,
    area: '3,500 sqft',
    yearBuilt: 2015,
    type: 'Villa',
    parkingSpots: 2,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7f34b5063c8?w=500&auto=format&q=80',
    ],
    features: [
      'Infinity Pool',
      'Ocean View',
      'Smart Home System',
      'Wine Cellar',
      'Home Theater',
      'Outdoor Kitchen',
      'Private Beach Access',
      'Spa/Hot Tub',
      'Gated Community',
      'Boat Dock',
    ],
    agent: {
      name: 'Michael Rodriguez',
      phone: '+1 (555) 987-6543',
      email: 'michael.rodriguez@example.com',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&q=80',
    },
    location: {
      latitude: 25.7617,
      longitude: -80.1918,
    },
  },
  '3': {
    id: '3',
    title: 'Cozy Suburban Home',
    address: '789 Oak Dr, Austin, TX',
    price: '$850,000',
    description:
      'Welcome to this charming suburban home nestled in a quiet, family-friendly neighborhood. This well-maintained property features an open floor plan with a spacious living room, a formal dining area, and a gourmet kitchen with stainless steel appliances. The backyard is perfect for entertaining with a covered patio, a built-in BBQ, and a lush garden. The primary suite includes a spa-like bathroom with a soaking tub and a walk-in closet.',
    beds: 4,
    baths: 3,
    area: '2,200 sqft',
    yearBuilt: 2010,
    type: 'House',
    parkingSpots: 2,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1560185008-a33f5c7cc8b4?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=500&auto=format&q=80',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=500&auto=format&q=80',
    ],
    features: [
      'Fenced Backyard',
      'Covered Patio',
      'Built-in BBQ',
      'Fireplace',
      'Hardwood Floors',
      'Walk-in Closet',
      'Energy-efficient Windows',
      'Solar Panels',
      'Smart Thermostat',
      'Security System',
    ],
    agent: {
      name: 'Emily Chen',
      phone: '+1 (555) 456-7890',
      email: 'emily.chen@example.com',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&q=80',
    },
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
    },
  },
};

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<Array<{id: string, text: string, timestamp: Date}>>([]);
  
  // Animation for voice button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Voice assistant hook
  const {
    isListening,
    isProcessing,
    transcript,
    response,
    error,
    startListening,
    stopListening,
    cancelListening,
    processTextCommand,
  } = useVoiceAssistant({
    onResponse: handleVoiceResponse,
  });

  // Get property data based on id
  const property = PROPERTY_DATA[id as keyof typeof PROPERTY_DATA];

  // Start pulsing animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).stop();
    }
  }, [isListening, pulseAnim]);
  
  // Handle errors from voice assistant
  useEffect(() => {
    if (error) {
      logger.error('Voice assistant error in property detail', { error });
    }
  }, [error]);

  if (!property) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text variant="h4">Property not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.notFoundButton}
        />
      </View>
    );
  }
  
  // Handle voice assistant response
  function handleVoiceResponse(response: any) {
    logger.info('Voice assistant response in property detail', { response });
    
    if (response.action) {
      handleVoiceAction(response.action, response.params || {});
    }
    
    // If this is a voice note, save it
    if (response.action === 'add_note') {
      addVoiceNote(response.params?.note || response.response);
    }
  }
  
  // Handle voice assistant actions specific to property detail
  function handleVoiceAction(action: string, params: Record<string, any>) {
    switch (action) {
      case 'favorite':
        toggleFavorite();
        break;
      case 'schedule_viewing':
        handleScheduleViewing();
        break;
      case 'contact_agent':
        handleContact(params.method || 'call');
        break;
      case 'view_images':
        if (params.index && params.index > 0 && params.index <= property.images.length) {
          setActiveImageIndex(params.index - 1);
        }
        break;
      case 'share_property':
        handleShare();
        break;
      case 'view_map':
        handleViewMap();
        break;
      case 'add_note':
        // Already handled in handleVoiceResponse
        break;
      default:
        // Unknown action
        break;
    }
  }
  
  // Add a voice note
  function addVoiceNote(text: string) {
    const newNote = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
    };
    
    setVoiceNotes(prev => [...prev, newNote]);
  }

  const handleContact = (method: 'call' | 'email' | 'message') => {
    switch (method) {
      case 'call':
        Linking.openURL(`tel:${property.agent.phone}`);
        break;
      case 'email':
        Linking.openURL(
          `mailto:${property.agent.email}?subject=Inquiry about ${property.title}`
        );
        break;
      case 'message':
        router.push({
          pathname: '/(app)/chat',
          params: {
            agentId: property.agent.name.replace(/\s+/g, '-').toLowerCase(),
          },
        });
        break;
    }
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleScheduleViewing = () => {
    router.push({
      pathname: '/(app)/schedule-viewing',
      params: { propertyId: property.id },
    });
  };
  
  const handleShare = () => {
    // In a real app, this would use the Share API
    alert('Sharing property: ' + property.title);
  };
  
  const handleViewMap = () => {
    router.push({
      pathname: '/(app)/map-view',
      params: { 
        latitude: property.location.latitude.toString(),
        longitude: property.location.longitude.toString(),
        title: property.title
      },
    });
  };
  
  // Toggle voice assistant modal
  const toggleVoiceModal = () => {
    if (showVoiceModal) {
      // If closing, make sure we stop listening
      if (isListening) {
        cancelListening();
      }
      setShowVoiceModal(false);
    } else {
      setShowVoiceModal(true);
    }
  };
  
  // Handle microphone button press
  const handleMicPress = async () => {
    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      logger.error('Failed to handle mic press', error);
    }
  };
  
  // Render voice assistant modal
  const renderVoiceModal = () => (
    <Modal
      visible={showVoiceModal}
      transparent
      animationType="slide"
      onRequestClose={toggleVoiceModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text variant="h5">Voice Assistant</Text>
            <TouchableOpacity onPress={toggleVoiceModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.voiceContentContainer}>
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text variant="body1" style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.voiceInstructionsContainer}>
                <Text variant="body1" style={styles.voiceInstructionsText}>
                  {isListening 
                    ? 'Listening... Tap the mic to stop'
                    : 'Tap the mic and ask about this property'}
                </Text>
                {transcript ? (
                  <Text variant="body2" style={styles.transcriptText}>
                    "{transcript}"
                  </Text>
                ) : null}
                {response ? (
                  <Card style={styles.responseCard}>
                    <Text variant="body2">{response.response}</Text>
                  </Card>
                ) : null}
              </View>
            )}
          </View>
          
          <View style={styles.voiceControlsContainer}>
            <TouchableOpacity
              style={[
                styles.micButton,
                { backgroundColor: isListening ? theme.colors.error : theme.colors.primary }
              ]}
              onPress={handleMicPress}
              disabled={isProcessing}
            >
              <Animated.View
                style={[
                  styles.micButtonInner,
                  { transform: [{ scale: isListening ? pulseAnim : 1 }] }
                ]}
              >
                <Ionicons
                  name={isListening ? "mic" : "mic-outline"}
                  size={32}
                  color={theme.colors.white}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.voiceSuggestionsContainer}>
            <Text variant="subtitle2" style={styles.suggestionsTitle}>Try saying...</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
              {[
                "Add to favorites",
                "Schedule a viewing",
                "Call the agent",
                "Show me the map",
                "Take a note about this property",
                "Share this listing"
              ].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionChip,
                    { 
                      backgroundColor: theme.colors.gray100,
                      borderColor: theme.colors.gray300,
                    }
                  ]}
                  onPress={() => processTextCommand(suggestion)}
                  disabled={isListening || isProcessing}
                >
                  <Text variant="body2">{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  // Render voice notes section if there are notes
  const renderVoiceNotes = () => {
    if (voiceNotes.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Your Notes
        </Text>
        {voiceNotes.map(note => (
          <Card key={note.id} style={styles.noteCard}>
            <Text variant="body2">{note.text}</Text>
            <Text variant="caption" color={theme.colors.textLight} style={styles.noteTime}>
              {note.timestamp.toLocaleString()}
            </Text>
          </Card>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleFavorite}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? theme.colors.error : theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.images[activeImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.imageIndicators}>
            {property.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageIndicator,
                  activeImageIndex === index && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setActiveImageIndex(index)}
              />
            ))}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {property.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveImageIndex(index)}
                style={[
                  styles.thumbnailWrapper,
                  activeImageIndex === index && styles.activeThumbnail,
                ]}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Property Details */}
        <View style={styles.detailsContainer}>
          <Text variant="h4" style={styles.title}>
            {property.title}
          </Text>
          <Text variant="body1" style={styles.address}>
            {property.address}
          </Text>
          <Text variant="h5" style={styles.price}>
            {property.price}
          </Text>

          {/* Property Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="bed-outline" size={24} color={theme.colors.primary} />
              <Text variant="body2" style={styles.featureText}>
                {property.beds} {property.beds > 1 ? 'Beds' : 'Bed'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="water-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="body2" style={styles.featureText}>
                {property.baths} {property.baths > 1 ? 'Baths' : 'Bath'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="square-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="body2" style={styles.featureText}>
                {property.area}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="car-outline" size={24} color={theme.colors.primary} />
              <Text variant="body2" style={styles.featureText}>
                {property.parkingSpots} {property.parkingSpots > 1 ? 'Spots' : 'Spot'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text variant="h6" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="body2" style={styles.description}>
              {property.description}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text variant="h6" style={styles.sectionTitle}>
              Features
            </Text>
            <View style={styles.featuresList}>
              {property.features.map((feature, index) => (
                <View key={index} style={styles.featureListItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text variant="body2" style={styles.featureListText}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Voice Notes Section */}
          {renderVoiceNotes()}

          {/* Agent Information */}
          <View style={styles.section}>
            <Text variant="h6" style={styles.sectionTitle}>
              Listed By
            </Text>
            <Card style={styles.agentCard}>
              <View style={styles.agentInfo}>
                <Image
                  source={{ uri: property.agent.image }}
                  style={styles.agentImage}
                />
                <View style={styles.agentDetails}>
                  <Text variant="subtitle1">{property.agent.name}</Text>
                  <Text variant="body2" color={theme.colors.textLight}>
                    {property.agent.phone}
                  </Text>
                  <Text variant="body2" color={theme.colors.textLight}>
                    {property.agent.email}
                  </Text>
                </View>
              </View>
              <View style={styles.agentActions}>
                <TouchableOpacity
                  style={[
                    styles.agentActionButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleContact('call')}
                >
                  <Ionicons name="call-outline" size={20} color={theme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.agentActionButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleContact('email')}
                >
                  <Ionicons name="mail-outline" size={20} color={theme.colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.agentActionButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleContact('message')}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={theme.colors.white}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          </View>

          {/* Map Preview */}
          <View style={styles.section}>
            <Text variant="h6" style={styles.sectionTitle}>
              Location
            </Text>
            <TouchableOpacity
              style={styles.mapPreview}
              onPress={handleViewMap}
            >
              <Image
                source={{
                  uri: `https://maps.googleapis.com/maps/api/staticmap?center=${property.location.latitude},${property.location.longitude}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${property.location.latitude},${property.location.longitude}&key=YOUR_API_KEY`,
                }}
                style={styles.mapImage}
              />
              <View style={styles.mapOverlay}>
                <Text variant="body2" color={theme.colors.white}>
                  View on Map
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.background }]}>
        <Button
          title="Schedule a Viewing"
          variant="primary"
          style={styles.scheduleButton}
          onPress={handleScheduleViewing}
        />
        <TouchableOpacity
          style={[styles.voiceButton, { backgroundColor: theme.colors.primary }]}
          onPress={toggleVoiceModal}
        >
          <Ionicons name="mic-outline" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      
      {/* Voice Assistant Modal */}
      {renderVoiceModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundButton: {
    marginTop: 20,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  thumbnailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
  },
  thumbnailsContent: {
    paddingHorizontal: 10,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: 'white',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 12,
  },
  price: {
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 22,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  featureListText: {
    marginLeft: 8,
  },
  agentCard: {
    padding: 16,
  },
  agentInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  agentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  agentDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  agentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  agentActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPreview: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  scheduleButton: {
    flex: 1,
    marginRight: 12,
  },
  voiceButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  voiceContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
  },
  voiceInstructionsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  voiceInstructionsText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  transcriptText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  responseCard: {
    padding: 16,
    width: '100%',
  },
  voiceControlsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceSuggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    marginBottom: 10,
  },
  suggestionsScroll: {
    flexDirection: 'row',
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  noteCard: {
    padding: 16,
    marginBottom: 10,
  },
  noteTime: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
});

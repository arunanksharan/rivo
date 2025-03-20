import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/TextInput';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { logger } from '@/utils/logger';

// Mock function to simulate AI property analysis
const analyzePropertyImage = async (imageUri: string, notes?: string): Promise<{
  title: string;
  description: string;
  estimatedPrice: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
}> => {
  // In a real app, this would call an OpenAI API or similar service
  logger.info('Analyzing property image', { imageUri, notes });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data
  return {
    title: notes ? `Property with ${notes.substring(0, 20)}...` : 'Modern Apartment with Great View',
    description: 'This beautiful property features modern amenities, spacious rooms, and natural lighting throughout. Located in a prime area with easy access to transportation, shopping, and dining options.',
    estimatedPrice: '₹1,25,00,000',
    propertyType: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,500 sqft',
  };
};

interface PropertyPhoto {
  id: string;
  uri: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  analysis?: {
    title: string;
    description: string;
    estimatedPrice: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
  };
}

export default function PropertyCameraScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PropertyPhoto | null>(null);
  const [textNote, setTextNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  
  // Voice assistant hook for transcription
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
  } = useVoiceAssistant();
  
  // Recording reference
  const recordingRef = useRef<Audio.Recording | null>(null);
  
  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: microphoneStatus } = await Audio.requestPermissionsAsync();
      
      if (cameraStatus !== 'granted' || locationStatus !== 'granted' || microphoneStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera, location, and microphone permissions to use all features of this app.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);
  
  // Handle camera button press
  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Get location
        let location;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const locationData = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
            });
            
            location = {
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
              address: address[0] ? `${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''}, ${address[0].country || ''}` : undefined,
            };
          }
        } catch (error) {
          logger.error('Failed to get location', error);
        }
        
        // Create new photo object
        const newPhoto: PropertyPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          timestamp: new Date(),
          location,
        };
        
        // Add to photos array
        setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
        
        // Select the new photo
        setSelectedPhoto(newPhoto);
      }
    } catch (error) {
      logger.error('Failed to take photo', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle gallery button press
  const handlePickImage = async () => {
    try {
      setIsLoading(true);
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Get location
        let location;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const locationData = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
            });
            
            location = {
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
              address: address[0] ? `${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''}, ${address[0].country || ''}` : undefined,
            };
          }
        } catch (error) {
          logger.error('Failed to get location', error);
        }
        
        // Create new photo object
        const newPhoto: PropertyPhoto = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          timestamp: new Date(),
          location,
        };
        
        // Add to photos array
        setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
        
        // Select the new photo
        setSelectedPhoto(newPhoto);
      }
    } catch (error) {
      logger.error('Failed to pick image', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle voice note recording
  const handleVoiceNote = async () => {
    try {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          const uri = recordingRef.current.getURI();
          recordingRef.current = null;
          
          if (uri) {
            setRecordingUri(uri);
            
            // Start listening for transcription
            await startListening();
          }
        }
      } else {
        // Start recording
        setIsRecording(true);
        setRecordingUri(null);
        
        // Configure audio session
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeIOS: 1, // DoNotMix value
          interruptionModeAndroid: 1, // DoNotMix value
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        // Start recording
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        recordingRef.current = recording;
      }
    } catch (error) {
      logger.error('Failed to record voice note', error);
      Alert.alert('Error', 'Failed to record voice note. Please try again.');
      setIsRecording(false);
    }
  };
  
  // Handle transcription completion
  useEffect(() => {
    if (!isListening && transcript && selectedPhoto) {
      // Update selected photo with transcribed note
      setSelectedPhoto(prev => {
        if (!prev) return null;
        return { ...prev, notes: transcript };
      });
      
      // Update photos array
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === selectedPhoto.id 
            ? { ...photo, notes: transcript } 
            : photo
        )
      );
      
      // Clear text note field and set it to the transcript
      setTextNote(transcript);
    }
  }, [isListening, transcript, selectedPhoto]);
  
  // Handle text note change
  const handleTextNoteChange = (text: string) => {
    setTextNote(text);
    
    if (selectedPhoto) {
      // Update selected photo with text note
      setSelectedPhoto(prev => {
        if (!prev) return null;
        return { ...prev, notes: text };
      });
      
      // Update photos array
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === selectedPhoto.id 
            ? { ...photo, notes: text } 
            : photo
        )
      );
    }
  };
  
  // Handle analyze button press
  const handleAnalyzeProperty = async () => {
    if (!selectedPhoto) return;
    
    try {
      setIsAnalyzing(true);
      
      // Analyze property image
      const analysis = await analyzePropertyImage(selectedPhoto.uri, selectedPhoto.notes);
      
      // Update selected photo with analysis
      setSelectedPhoto(prev => {
        if (!prev) return null;
        return { ...prev, analysis };
      });
      
      // Update photos array
      setPhotos(prevPhotos => 
        prevPhotos.map(photo => 
          photo.id === selectedPhoto.id 
            ? { ...photo, analysis } 
            : photo
        )
      );
    } catch (error) {
      logger.error('Failed to analyze property', error);
      Alert.alert('Error', 'Failed to analyze property. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle save to inventory button press
  const handleSaveToInventory = () => {
    if (!selectedPhoto || !selectedPhoto.analysis) {
      Alert.alert('Analysis Required', 'Please analyze the property before saving to inventory.');
      return;
    }
    
    // In a real app, this would call an API to save the property to the inventory
    Alert.alert(
      'Success',
      'Property has been saved to your inventory.',
      [
        {
          text: 'View Inventory',
          onPress: () => router.push('/(app)/property-inventory'),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };
  
  // Render photo grid
  const renderPhotoGrid = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.photoGrid}
    >
      {photos.map(photo => (
        <TouchableOpacity
          key={photo.id}
          style={[
            styles.photoThumbnail,
            selectedPhoto?.id === photo.id && { 
              borderColor: theme.colors.primary,
              borderWidth: 2,
            },
          ]}
          onPress={() => setSelectedPhoto(photo)}
        >
          <Image source={{ uri: photo.uri }} style={styles.thumbnailImage} />
          {photo.analysis && (
            <View style={[styles.analyzedBadge, { backgroundColor: theme.colors.success }]}>
              <Ionicons name="checkmark" size={12} color={theme.colors.white} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  // Render selected photo details
  const renderSelectedPhotoDetails = () => {
    if (!selectedPhoto) return null;
    
    return (
      <Card style={styles.selectedPhotoCard}>
        <Image source={{ uri: selectedPhoto.uri }} style={styles.selectedPhotoImage} />
        
        <View style={styles.photoDetails}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            <Text variant="caption" style={styles.locationText}>
              {selectedPhoto.location?.address || 'Location not available'}
            </Text>
          </View>
          
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.gray600} />
            <Text variant="caption" style={styles.timestampText}>
              {selectedPhoto.timestamp.toLocaleString()}
            </Text>
          </View>
          
          <TextInput
            placeholder="Add a text note about this property..."
            value={textNote}
            onChangeText={handleTextNoteChange}
            multiline
            numberOfLines={3}
            containerStyle={styles.textNoteInput}
          />
          
          <View style={styles.voiceNoteContainer}>
            <Button
              title={isRecording ? "Stop Recording" : "Record Voice Note"}
              variant={isRecording ? "primary" : "outline"}
              leftIcon={
                <Ionicons 
                  name={isRecording ? "mic" : "mic-outline"} 
                  size={20} 
                  color={isRecording ? theme.colors.white : theme.colors.primary} 
                />
              }
              onPress={handleVoiceNote}
              style={styles.voiceNoteButton}
            />
            
            {recordingUri && !isListening && (
              <Text variant="caption" color={theme.colors.success} style={styles.recordingStatus}>
                Voice note recorded
              </Text>
            )}
            
            {isListening && (
              <View style={styles.transcribingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="caption" style={styles.transcribingText}>
                  Transcribing...
                </Text>
              </View>
            )}
          </View>
          
          {selectedPhoto.analysis ? (
            <View style={styles.analysisContainer}>
              <Text variant="subtitle1" style={styles.analysisTitle}>
                {selectedPhoto.analysis.title}
              </Text>
              
              <Text variant="body2" style={styles.analysisDescription}>
                {selectedPhoto.analysis.description}
              </Text>
              
              <View style={styles.propertyDetailsGrid}>
                <View style={styles.propertyDetailItem}>
                  <Ionicons name="cash-outline" size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.propertyDetailLabel}>Price</Text>
                  <Text variant="subtitle2" style={styles.propertyDetailValue}>
                    {selectedPhoto.analysis.estimatedPrice}
                  </Text>
                </View>
                
                <View style={styles.propertyDetailItem}>
                  <Ionicons name="home-outline" size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.propertyDetailLabel}>Type</Text>
                  <Text variant="subtitle2" style={styles.propertyDetailValue}>
                    {selectedPhoto.analysis.propertyType}
                  </Text>
                </View>
                
                <View style={styles.propertyDetailItem}>
                  <Ionicons name="bed-outline" size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.propertyDetailLabel}>Bedrooms</Text>
                  <Text variant="subtitle2" style={styles.propertyDetailValue}>
                    {selectedPhoto.analysis.bedrooms}
                  </Text>
                </View>
                
                <View style={styles.propertyDetailItem}>
                  <Ionicons name="water-outline" size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.propertyDetailLabel}>Bathrooms</Text>
                  <Text variant="subtitle2" style={styles.propertyDetailValue}>
                    {selectedPhoto.analysis.bathrooms}
                  </Text>
                </View>
                
                <View style={styles.propertyDetailItem}>
                  <Ionicons name="resize-outline" size={16} color={theme.colors.primary} />
                  <Text variant="caption" style={styles.propertyDetailLabel}>Area</Text>
                  <Text variant="subtitle2" style={styles.propertyDetailValue}>
                    {selectedPhoto.analysis.area}
                  </Text>
                </View>
              </View>
              
              <Button
                title="Save to Inventory"
                onPress={handleSaveToInventory}
                style={styles.saveButton}
              />
            </View>
          ) : (
            <Button
              title="Analyze Property"
              onPress={handleAnalyzeProperty}
              isLoading={isAnalyzing}
              style={styles.analyzeButton}
            />
          )}
        </View>
      </Card>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="h4">Property Camera</Text>
        <Text variant="body2" color={theme.colors.textLight}>
          Capture and analyze properties
        </Text>
      </View>
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {photos.length > 0 ? (
          <>
            {renderPhotoGrid()}
            {selectedPhoto && renderSelectedPhotoDetails()}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={64} color={theme.colors.gray400} />
            <Text variant="h5" style={styles.emptyStateTitle}>No Photos Yet</Text>
            <Text variant="body2" color={theme.colors.textLight} style={styles.emptyStateText}>
              Take photos of properties to analyze and add to your inventory.
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Photo Gallery"
          variant="outline"
          leftIcon={<Ionicons name="images-outline" size={20} color={theme.colors.text} />}
          onPress={handlePickImage}
          style={styles.galleryButton}
          disabled={isLoading}
        />
        
        <TouchableOpacity
          style={[
            styles.cameraButton,
            { backgroundColor: theme.colors.primary },
            isLoading && { opacity: 0.7 },
          ]}
          onPress={handleTakePhoto}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Ionicons name="camera" size={28} color={theme.colors.white} />
          )}
        </TouchableOpacity>
        
        <Button
          title="Inventory"
          variant="outline"
          leftIcon={<Ionicons name="list-outline" size={20} color={theme.colors.text} />}
          onPress={() => router.push('/(app)/property-inventory')}
          style={styles.inventoryButton}
          disabled={isLoading}
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
    padding: 16,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  galleryButton: {
    flex: 1,
    marginRight: 8,
  },
  cameraButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  inventoryButton: {
    flex: 1,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  photoGrid: {
    paddingVertical: 16,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  analyzedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPhotoCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  selectedPhotoImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoDetails: {
    padding: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timestampText: {
    marginLeft: 4,
  },
  textNoteInput: {
    marginBottom: 16,
  },
  voiceNoteContainer: {
    marginBottom: 16,
  },
  voiceNoteButton: {
    marginBottom: 8,
  },
  recordingStatus: {
    textAlign: 'center',
  },
  transcribingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  transcribingText: {
    marginLeft: 8,
  },
  analysisContainer: {
    marginTop: 16,
  },
  analysisTitle: {
    marginBottom: 8,
  },
  analysisDescription: {
    marginBottom: 16,
  },
  propertyDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  propertyDetailItem: {
    width: '33%',
    marginBottom: 16,
    alignItems: 'center',
  },
  propertyDetailLabel: {
    marginTop: 4,
    marginBottom: 2,
  },
  propertyDetailValue: {
    textAlign: 'center',
  },
  analyzeButton: {
    marginTop: 8,
  },
  saveButton: {
    marginTop: 8,
  },
});

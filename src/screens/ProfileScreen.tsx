import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('Pramod Patil');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);

  // 📸 Profile photo options
  const handlePhotoOptions = () => {
    Alert.alert('Change Profile Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => {
          launchCamera({ mediaType: 'photo' }, handleImagePickerResponse);
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo' }, handleImagePickerResponse);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Image picker error');
      return;
    }
    if (response.assets && response.assets.length > 0) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        setProfileImage(imageUri);
      }
    }
  };

  // ✏️ Edit name
  const handleEditToggle = () => {
    if (isEditing) {
      setName(tempName);
    } else {
      setTempName(name);
    }
    setIsEditing(!isEditing);
  };

  // 🚪 Logout
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(); // AuthContext handles API + storage
            Alert.alert('Success', 'Logout successful');
          } catch (e) {
            Alert.alert('Error', 'Logout failed. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Content */}
      <View style={styles.profileContent}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePhotoOptions}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('../assets/icons/user.png')
              }
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              <Icon name="camera" size={16} color="#666" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              {isEditing ? (
                <TextInput
                  value={tempName}
                  onChangeText={setTempName}
                  style={styles.nameInput}
                  placeholder="Enter name"
                />
              ) : (
                <Text style={styles.name}>{name}</Text>
              )}
              <TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
                <Icon
                  name={isEditing ? 'check' : 'pencil-outline'}
                  size={14}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.username}>@{name.toLowerCase().replace(/\s+/g, '')}</Text>
          </View>
        </View>

        {/* 🚪 Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 34 },
  profileContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E5E5' },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  profileInfo: { flex: 1 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333', marginRight: 8 },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 2,
    flex: 1,
  },
  editButton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: { fontSize: 16, color: '#666' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D6D99',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 30,
    justifyContent: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

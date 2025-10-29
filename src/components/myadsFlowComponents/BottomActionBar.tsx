import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  onChat?: () => void;
  onBid?: () => void;
  chatLabel?: string;
  bidLabel?: string;
  containerStyle?: ViewStyle;
  chatDisabled?: boolean;
  bidDisabled?: boolean;
  showChat?: boolean;
  showBid?: boolean;
};

const BottomActionBar: React.FC<Props> = ({
  onChat,
  onBid,
  chatLabel = 'Chat',
  bidLabel = 'Start Bidding',
  containerStyle,
  chatDisabled = false,
  bidDisabled = false,
  showChat = true,
  showBid = true,
}) => {
  if (!showChat && !showBid) {
    return null;
  }

  return (
    <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={styles.positioner}>
      <View style={[styles.container, containerStyle]}>
        {showChat && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.chatButton,
              showBid && styles.buttonSpacing,
              chatDisabled && styles.disabled,
            ]}
            onPress={onChat}
            activeOpacity={0.85}
            disabled={chatDisabled}
          >
            <Icon name="message-text-outline" size={20} color="#143444" style={styles.icon} />
            <Text style={[styles.buttonText, styles.chatText]}>{chatLabel}</Text>
          </TouchableOpacity>
        )}

        {showBid && (
          <TouchableOpacity
            style={[styles.button, styles.bidButton, bidDisabled && styles.disabled]}
            onPress={onBid}
            activeOpacity={0.85}
            disabled={bidDisabled}
          >
            <Icon name="gavel" size={20} color="#ffffff" style={styles.icon} />
            <Text style={styles.buttonText}>{bidLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BottomActionBar;

const styles = StyleSheet.create({
  positioner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    minHeight: 54,
  },
  chatButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#143444',
  },
  bidButton: {
    backgroundColor: '#143444',
  },
  buttonSpacing: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  chatText: {
    color: '#143444',
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

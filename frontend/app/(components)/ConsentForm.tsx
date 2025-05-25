import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Checkbox } from 'react-native-paper';
import userService from '../(services)/userService';

interface ConsentFormProps {
  onConsentGiven: () => void;
  userId: number;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ onConsentGiven, userId }) => {
  const [consents, setConsents] = useState({
    dataProcessing: false,
    dataSharing: false,
    marketing: false,
    research: false,
  });

  const handleConsent = async () => {
    try {
      await userService.updateConsent(userId, {
        consent_given: true,
        consent_details: {
          dataProcessing: consents.dataProcessing,
          dataSharing: consents.dataSharing,
          marketing: consents.marketing,
          research: consents.research,
          timestamp: new Date().toISOString(),
        },
      });

      onConsentGiven();
    } catch (error) {
      Alert.alert('Error', 'Failed to record consent. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data Processing Consent</Text>
      <Text style={styles.subtitle}>
        Please review and provide your consent for data processing according to GDPR requirements.
      </Text>

      <View style={styles.section}>
        <View style={styles.consentItem}>
          <Checkbox
            status={consents.dataProcessing ? 'checked' : 'unchecked'}
            onPress={() => setConsents(prev => ({ ...prev, dataProcessing: !prev.dataProcessing }))}
          />
          <View style={styles.consentText}>
            <Text style={styles.consentTitle}>Data Processing</Text>
            <Text style={styles.consentDescription}>
              I consent to the processing of my personal data for the purpose of providing rehabilitation services.
            </Text>
          </View>
        </View>

        <View style={styles.consentItem}>
          <Checkbox
            status={consents.dataSharing ? 'checked' : 'unchecked'}
            onPress={() => setConsents(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
          />
          <View style={styles.consentText}>
            <Text style={styles.consentTitle}>Data Sharing with Healthcare Providers</Text>
            <Text style={styles.consentDescription}>
              I consent to sharing my health data with my assigned healthcare providers for treatment purposes.
            </Text>
          </View>
        </View>

        <View style={styles.consentItem}>
          <Checkbox
            status={consents.marketing ? 'checked' : 'unchecked'}
            onPress={() => setConsents(prev => ({ ...prev, marketing: !prev.marketing }))}
          />
          <View style={styles.consentText}>
            <Text style={styles.consentTitle}>Marketing Communications</Text>
            <Text style={styles.consentDescription}>
              I consent to receive marketing communications about relevant healthcare services.
            </Text>
          </View>
        </View>

        <View style={styles.consentItem}>
          <Checkbox
            status={consents.research ? 'checked' : 'unchecked'}
            onPress={() => setConsents(prev => ({ ...prev, research: !prev.research }))}
          />
          <View style={styles.consentText}>
            <Text style={styles.consentTitle}>Research Participation</Text>
            <Text style={styles.consentDescription}>
              I consent to the anonymized use of my data for medical research purposes.
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.privacyNotice}>
        Your privacy is important to us. We process your data in accordance with GDPR requirements.
        You can withdraw your consent at any time through your account settings.
      </Text>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!consents.dataProcessing || !consents.dataSharing) && styles.submitButtonDisabled
        ]}
        onPress={handleConsent}
        disabled={!consents.dataProcessing || !consents.dataSharing}
      >
        <Text style={styles.submitButtonText}>Give Consent</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  consentText: {
    flex: 1,
    marginLeft: 8,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  consentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  privacyNotice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConsentForm; 
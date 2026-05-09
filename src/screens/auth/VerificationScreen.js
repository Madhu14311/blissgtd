/**
 * VerificationScreen.js
 *
 * Used in TWO contexts:
 *
 * CONTEXT A — After registration (via AuthNavigator, user NOT logged in):
 *   route.params.user contains the newly registered user
 *   After submit → show success → "Go Back to Login" button → navigate('Login')
 *
 * CONTEXT B — From Profile inside role dashboard (user IS logged in):
 *   reads user from AuthStore session
 *   After submit → "Back to Profile" → navigation.goBack()
 *
 * VERIFICATION STATUSES:
 *   not_submitted → show upload form
 *   pending       → show "waiting for approval" + "Go Back to Login" or "Back to Profile"
 *   approved      → show approved state
 *   rejected      → show rejected + resubmit option
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore } from '../../store/AuthStore';
import { useAppContext } from '../superadmin/SocietyContext';

const P = {
  teal:          '#1A7A7A',
  tealDark:      '#0D6E6E',
  tealSoft:      '#E8F5F5',
  tealMid:       '#D0EEEE',
  bg:            '#E8F5F5',
  surface:       '#FFFFFF',
  text:          '#1A2E2E',
  textMuted:     '#7A9E9E',
  textSub:       '#3D6E6E',
  border:        '#D0EEEE',
  success:       '#2E7D32',
  successBg:     '#E8F5E9',
  successBorder: '#A5D6A7',
  warning:       '#E65100',
  warningBg:     '#FEF3C7',
  warningBorder: '#FDE68A',
  danger:        '#C62828',
  dangerBg:      '#FEE2E2',
  dangerBorder:  '#FECACA',
  blue:          '#1D4ED8',
  blueBg:        '#EFF6FF',
  blueBorder:    '#BFDBFE',
};

const DOCS_BY_ROLE = {
  // ── RESIDENT ──────────────────────────────────────────────────────────────
  // Source: Module 2 — KYC & Verification: Aadhaar, PAN, Address Proof, Police Verification
  resident: [
    { id: 'aadhaar',       label: 'Aadhaar Card',                  desc: 'Mandatory KYC — Aadhaar front & back',                   required: true  },
    { id: 'pan',           label: 'PAN Card',                      desc: 'PAN card of owner / tenant',                             required: true  },
    { id: 'flat_doc',      label: 'Flat Ownership / Tenancy Proof',desc: 'Sale Deed / Allotment Letter / Registered Rent Agreement',required: true  },
    { id: 'photo',         label: 'Passport Size Photo',           desc: 'Clear recent photograph of self',                        required: true  },
    { id: 'address_proof', label: 'Address Proof',                 desc: 'Utility bill / Bank passbook / Voter ID',                required: true  },
    { id: 'police_verify', label: 'Police Verification (Tenant)',  desc: 'Required for tenants — NOC from local police station',   required: false },
    { id: 'vehicle_rc',    label: 'Vehicle RC Book',               desc: 'RC book for each registered vehicle (car/bike/EV)',      required: false },
    { id: 'emergency_id',  label: 'Emergency Contact ID Proof',    desc: 'ID proof of emergency contact person',                   required: false },
  ],

  // ── VENDOR GENERIC FALLBACK ───────────────────────────────────────────────
  vendor: [
    { id: 'business_reg', label: 'Business Registration Certificate', desc: 'Shop Act License / MSME / Trade License / Partnership Deed', required: true  },
    { id: 'gst',          label: 'GST Certificate',                   desc: 'GSTIN registration certificate',                            required: true  },
    { id: 'id_proof',     label: 'Owner / Proprietor ID Proof',       desc: 'Aadhaar Card or PAN Card',                                  required: true  },
    { id: 'photo',        label: 'Owner / Business Photo',            desc: 'Recent passport-size photograph',                           required: true  },
    { id: 'bank_cancel',  label: 'Cancelled Cheque / Bank Details',   desc: 'For payment disbursement to your account',                  required: true  },
  ],

  // ── BUSINESS VENDOR (Service: Plumbing, Electrical, Cleaning, AMC, etc.) ─
  // Source: Module 6 — Service Provider Ecosystem: Verified vendor, Background Verification, Insurance
  vendor_business: [
    { id: 'business_reg',  label: 'Business Registration Certificate', desc: 'Shop Act License / MSME / Trade License',                  required: true  },
    { id: 'gst',           label: 'GST Certificate',                   desc: 'GSTIN registration (mandatory if turnover > ₹20L)',         required: true  },
    { id: 'id_proof',      label: 'Owner / Proprietor ID Proof',       desc: 'Aadhaar Card (front & back) or PAN Card',                  required: true  },
    { id: 'photo',         label: 'Owner / Staff Passport Photo',      desc: 'Recent passport-size photograph',                          required: true  },
    { id: 'police_verify', label: 'Police Verification Certificate',   desc: 'Background check clearance — mandatory for service staff',  required: true  },
    { id: 'service_proof', label: 'Service Qualification / Certificate',desc: 'Trade certificate / ITI / Skill India / Electrician License',required: true },
    { id: 'insurance',     label: 'Liability Insurance Certificate',   desc: 'Worker liability / third-party insurance (if any)',         required: false },
    { id: 'bank_cancel',   label: 'Cancelled Cheque / Bank Details',   desc: 'For payment disbursement after work completion',            required: true  },
  ],

  // ── MARKETPLACE VENDOR (Online Store: Grocery, Dairy, Bakery, Pharmacy) ─
  // Source: Module 9 — Vendor Onboarding: GST verification, FSSAI, Bank account linking
  vendor_marketplace: [
    { id: 'fssai',        label: 'FSSAI Food License',                desc: 'Mandatory for grocery / food / pharmacy businesses',         required: true  },
    { id: 'gst',          label: 'GST Certificate',                   desc: 'GSTIN registration for your store',                          required: true  },
    { id: 'id_proof',     label: 'Owner ID Proof',                    desc: 'Aadhaar Card (front & back) or PAN Card',                   required: true  },
    { id: 'store_photo',  label: 'Store / Shop Front Photo',          desc: 'Clear photo of your physical store, warehouse, or outlet',   required: true  },
    { id: 'product_list', label: 'Product Catalog / Price List',      desc: 'List of products / SKUs you intend to sell',                 required: true  },
    { id: 'bank_cancel',  label: 'Cancelled Cheque / Bank Details',   desc: 'For marketplace earnings disbursement',                      required: true  },
    { id: 'trade_lic',    label: 'Trade / Municipal License',         desc: 'Municipal corporation trade / shop license',                 required: false },
    { id: 'commission',   label: 'Commission Agreement (Signed)',     desc: 'Signed platform commission agreement (10–15%)',              required: false },
  ],

  // ── SECURITY GUARD ────────────────────────────────────────────────────────
  // Source: Module 3 — Guard Dashboard + Biometric staff fingerprint registration
  security: [
    { id: 'aadhaar',       label: 'Aadhaar Card',                    desc: 'Mandatory — Aadhaar front & back scan',                      required: true  },
    { id: 'police_verify', label: 'Police Verification Certificate', desc: 'Background check clearance from local police station',        required: true  },
    { id: 'photo',         label: 'Passport Size Photo',             desc: 'Clear recent photograph for biometric registration',          required: true  },
    { id: 'address_proof', label: 'Current Address Proof',           desc: 'Utility bill / Voter ID / Bank passbook',                    required: true  },
    { id: 'experience',    label: 'Experience Letter',               desc: 'Letter from previous security employer (if any)',            required: false },
    { id: 'medical_fit',   label: 'Medical Fitness Certificate',     desc: 'Basic fitness certificate from registered doctor',           required: false },
  ],

  // ── BUILDER ───────────────────────────────────────────────────────────────
  // Source: Module 17 — RERA Compliance, Project Management, Builder Module
  builder: [
    { id: 'rera',           label: 'RERA Registration Certificate',  desc: 'State RERA certificate — mandatory for all projects',        required: true  },
    { id: 'gst',            label: 'GST Certificate',                desc: 'Company GSTIN registration',                                required: true  },
    { id: 'company_pan',    label: 'Company PAN Card',               desc: 'PAN of the registered company / firm',                      required: true  },
    { id: 'incorporation',  label: 'Company Incorporation Certificate',desc: 'Certificate of Incorporation from MCA / ROC',             required: true  },
    { id: 'director_id',    label: 'Director / Promoter ID Proof',   desc: 'Aadhaar or passport of all directors / promoters',          required: true  },
    { id: 'company_address',label: 'Company Address Proof',          desc: 'Registered office address proof (utility bill / lease)',    required: true  },
    { id: 'rera_project',   label: 'RERA Approved Project Documents',desc: 'Approved layout plans / sanctions / RERA project details',  required: false },
    { id: 'bank_details',   label: 'Company Bank Account Details',   desc: 'Cancelled cheque of company bank account',                  required: false },
  ],

  // ── ADMIN (Society Chairman / Secretary / Treasurer / Committee) ──────────
  // Source: Module 1 — Admin Hierarchy: Chairman/President, Secretary/Treasurer, Role-based permissions
  // Source: Module 14 — Admin Dashboard: Society Configuration, User Management
  admin: [
    { id: 'id_proof',      label: 'Government ID Proof',              desc: 'Aadhaar Card (front & back) or PAN Card',                   required: true  },
    { id: 'photo',         label: 'Passport Size Photo',              desc: 'Clear recent photograph',                                   required: true  },
    { id: 'authorization', label: 'Authorization Letter / Resolution',desc: 'Society MC Resolution / NOC authorizing you as admin',      required: true  },
    { id: 'society_reg',   label: 'Society Registration Certificate', desc: 'Society registration cert from Registrar of Societies',     required: true  },
    { id: 'address_proof', label: 'Society Address Proof',            desc: 'Property tax receipt / utility bill of society premises',   required: true  },
    { id: 'bye_laws',      label: 'Society Bye-Laws',                 desc: 'Registered society bye-laws document',                      required: false },
    { id: 'prev_minutes',  label: 'Previous AGM / Meeting Minutes',   desc: 'Latest Annual General Meeting minutes (if available)',      required: false },
  ],
};

const ROLE_FIELDS = {
  // ── RESIDENT ──────────────────────────────────────────────────────────────
  resident: [
    { id: 'flat',            label: 'Flat / Unit Number',       placeholder: 'e.g. B-204',              keyboardType: 'default' },
    { id: 'block',           label: 'Block / Tower / Wing',     placeholder: 'e.g. Block B / Tower 2',  keyboardType: 'default' },
    { id: 'floor',           label: 'Floor Number',             placeholder: 'e.g. 2',                  keyboardType: 'numeric' },
    { id: 'bhk',             label: 'Flat Type (BHK)',          placeholder: 'e.g. 2 BHK',              keyboardType: 'default' },
    { id: 'ownership',       label: 'Owner / Tenant',           placeholder: 'Owner or Tenant',          keyboardType: 'default' },
    { id: 'members',         label: 'Number of Family Members', placeholder: 'e.g. 4',                  keyboardType: 'numeric' },
    { id: 'vehicles',        label: 'Number of Vehicles',       placeholder: 'e.g. 1',                  keyboardType: 'numeric' },
    { id: 'emergencyName',   label: 'Emergency Contact Name',   placeholder: 'e.g. Ramesh Kumar',       keyboardType: 'default' },
    { id: 'emergencyPhone',  label: 'Emergency Contact Phone',  placeholder: 'e.g. 9876543210',         keyboardType: 'phone-pad' },
  ],

  // ── VENDOR GENERIC FALLBACK ───────────────────────────────────────────────
  vendor: [
    { id: 'businessName',  label: 'Business / Shop Name',    placeholder: 'e.g. Raju Electricals',          keyboardType: 'default' },
    { id: 'gstNumber',     label: 'GST Number',              placeholder: 'e.g. 27XXXXX1234Z1ZV',           keyboardType: 'default' },
    { id: 'serviceArea',   label: 'Service Category',        placeholder: 'e.g. Electrical, Plumbing',      keyboardType: 'default' },
  ],

  // ── BUSINESS VENDOR ───────────────────────────────────────────────────────
  vendor_business: [
    { id: 'businessName',   label: 'Business / Shop Name',       placeholder: 'e.g. Raju Electricals',         keyboardType: 'default' },
    { id: 'gstNumber',      label: 'GST Number',                 placeholder: 'e.g. 27XXXXX1234Z1ZV',          keyboardType: 'default' },
    { id: 'serviceCategory',label: 'Service Categories',         placeholder: 'e.g. Electrical, Plumbing, AC', keyboardType: 'default' },
    { id: 'experience',     label: 'Years of Experience',        placeholder: 'e.g. 5',                        keyboardType: 'numeric' },
    { id: 'teamSize',       label: 'Team / Staff Size',          placeholder: 'e.g. 3',                        keyboardType: 'numeric' },
    { id: 'serviceRadius',  label: 'Service Area Radius (km)',   placeholder: 'e.g. 10',                       keyboardType: 'numeric' },
    { id: 'bankAccount',    label: 'Bank Account Number',        placeholder: 'For payment disbursement',      keyboardType: 'numeric' },
    { id: 'ifsc',           label: 'IFSC Code',                  placeholder: 'e.g. HDFC0001234',              keyboardType: 'default' },
  ],

  // ── MARKETPLACE VENDOR ────────────────────────────────────────────────────
  vendor_marketplace: [
    { id: 'storeName',      label: 'Store / Shop Name',          placeholder: 'e.g. Fresh Mart',               keyboardType: 'default' },
    { id: 'storeCategory',  label: 'Store Category',             placeholder: 'e.g. Grocery, Dairy, Bakery',   keyboardType: 'default' },
    { id: 'gstNumber',      label: 'GST Number',                 placeholder: 'e.g. 27XXXXX1234Z1ZV',          keyboardType: 'default' },
    { id: 'fssaiNumber',    label: 'FSSAI License Number',       placeholder: 'e.g. 11224099000441',           keyboardType: 'numeric' },
    { id: 'deliveryRadius', label: 'Delivery Radius (km)',       placeholder: 'e.g. 5',                        keyboardType: 'numeric' },
    { id: 'minOrder',       label: 'Minimum Order Amount (₹)',   placeholder: 'e.g. 200',                      keyboardType: 'numeric' },
    { id: 'bankAccount',    label: 'Bank Account Number',        placeholder: 'For earnings disbursement',     keyboardType: 'numeric' },
    { id: 'ifsc',           label: 'IFSC Code',                  placeholder: 'e.g. HDFC0001234',              keyboardType: 'default' },
  ],

  // ── SECURITY GUARD ────────────────────────────────────────────────────────
  security: [
    { id: 'gate',           label: 'Assigned Gate / Post',       placeholder: 'e.g. Main Gate / North Gate',   keyboardType: 'default' },
    { id: 'shift',          label: 'Shift Preference',           placeholder: 'Day / Night / Flexible',        keyboardType: 'default' },
    { id: 'experience',     label: 'Years of Experience',        placeholder: 'e.g. 3',                        keyboardType: 'numeric' },
    { id: 'prevEmployer',   label: 'Previous Employer',          placeholder: 'e.g. ABC Security Agency',      keyboardType: 'default' },
    { id: 'emergencyName',  label: 'Emergency Contact Name',     placeholder: 'e.g. Suresh Kumar',             keyboardType: 'default' },
    { id: 'emergencyPhone', label: 'Emergency Contact Phone',    placeholder: 'e.g. 9876543210',               keyboardType: 'phone-pad' },
  ],

  // ── BUILDER ───────────────────────────────────────────────────────────────
  builder: [
    { id: 'company',        label: 'Company / Firm Name',        placeholder: 'e.g. ABC Constructions Pvt Ltd', keyboardType: 'default' },
    { id: 'reraNumber',     label: 'RERA Registration Number',   placeholder: 'e.g. P52100040697',              keyboardType: 'default' },
    { id: 'gstNumber',      label: 'Company GST Number',         placeholder: 'e.g. 27AAAAA0000A1Z5',          keyboardType: 'default' },
    { id: 'city',           label: 'Primary Operating City',     placeholder: 'e.g. Pune',                     keyboardType: 'default' },
    { id: 'totalProjects',  label: 'Total Projects Completed',   placeholder: 'e.g. 12',                       keyboardType: 'numeric' },
    { id: 'website',        label: 'Company Website (Optional)', placeholder: 'e.g. https://abcbuilders.in',   keyboardType: 'url'     },
  ],

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  admin: [
    { id: 'societyName',    label: 'Society / Complex Name',     placeholder: 'e.g. Green Valley CHS',         keyboardType: 'default' },
    { id: 'designation',    label: 'Your Designation / Role',    placeholder: 'e.g. Secretary / Chairman',     keyboardType: 'default' },
    { id: 'societyReg',     label: 'Society Registration Number',placeholder: 'e.g. MH/123/2020',              keyboardType: 'default' },
    { id: 'totalFlats',     label: 'Total Flats / Units',        placeholder: 'e.g. 120',                      keyboardType: 'numeric' },
    { id: 'city',           label: 'City',                       placeholder: 'e.g. Mumbai',                   keyboardType: 'default' },
    { id: 'contactEmail',   label: 'Society Contact Email',      placeholder: 'e.g. admin@greenvalley.in',     keyboardType: 'email-address' },
  ],
};

const APPROVER = {
  resident: 'Admin', vendor: 'Admin', vendor_business: 'Admin', vendor_marketplace: 'Admin',
  security: 'Admin',
  builder: 'Super Admin', admin: 'Super Admin',
};

const ROLE_LABEL = {
  resident: 'Resident',
  vendor: 'Vendor',
  vendor_business: 'Business Vendor (Service Provider)',
  vendor_marketplace: 'Marketplace Vendor (Online Store)',
  security: 'Guard / Security',
  builder: 'Builder', admin: 'Admin',
};

function DocCard({ doc, uploaded, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.docCard, uploaded && { borderColor: P.successBorder, backgroundColor: '#F9FFFA' }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.docIconBox, { backgroundColor: uploaded ? P.successBg : P.tealSoft }]}>
        <Text style={{ fontSize: 24 }}>{uploaded ? '✅' : '📄'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docLabel}>{doc.label}</Text>
        <Text style={styles.docDesc}>{doc.desc}</Text>
        {!doc.required && <Text style={styles.optionalTag}>Optional</Text>}
      </View>
      <View style={[styles.uploadPill, { backgroundColor: uploaded ? P.successBg : P.tealSoft }]}>
        <Text style={[styles.uploadPillText, { color: uploaded ? P.success : P.teal }]}>
          {uploaded ? '✓ Done' : '+ Upload'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function VerificationScreen({ navigation, route }) {
  // CONTEXT A: came from registration/login flow — user passed via params
  // CONTEXT B: came from profile inside dashboard — user from store session
  const sessionUser        = useAuthStore(s => s.user);
  const submitVerification = useAuthStore(s => s.submitVerification);
  const registeredUsers    = useAuthStore(s => s.registeredUsers);
  const isLoggedIn         = useAuthStore(s => s.isLoggedIn);
  const { addAdminRequest, addBuilderRequest } = useAppContext();

  // Prefer route param user (registration flow), fall back to session user (profile flow)
  const paramUser  = route?.params?.user;
  const isResubmit = route?.params?.resubmit || false;

  // Determine which user we are verifying
  const activeUser = paramUser || sessionUser;
  // For vendors, use vendorType to pick the correct doc set / field set
  const baseRole   = activeUser?.role || 'resident';
  const vendorType = activeUser?.vendorType; // 'business' | 'marketplace' | undefined
  const role = baseRole === 'vendor' && vendorType
    ? `vendor_${vendorType}`   // → 'vendor_business' or 'vendor_marketplace'
    : baseRole;
  const docs       = DOCS_BY_ROLE[role]  || DOCS_BY_ROLE[baseRole] || [];
  const fields     = ROLE_FIELDS[role]   || ROLE_FIELDS[baseRole]  || [];
  const approver   = APPROVER[role]      || 'Admin';
  const roleLabel  = ROLE_LABEL[role]    || role;

  // Get LIVE verificationStatus from registeredUsers (reflects admin approval instantly)
  const liveUser           = registeredUsers.find(u => u.id === activeUser?.id) || activeUser;
  const verificationStatus = isResubmit ? 'not_submitted' : (liveUser?.verificationStatus || 'not_submitted');

  const [uploaded,    setUploaded]    = useState({});
  const [fieldValues, setFieldValues] = useState({});

  const requiredDocs = docs.filter(d => d.required);
  const requiredDone = requiredDocs.filter(d => uploaded[d.id]).length;

  // Context-aware back button
  // If not logged in (auth flow) → go to Login
  // If logged in (profile flow) → go back to profile
  const handleBack = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
    } else {
      navigation.goBack();
    }
  };

  // Context-aware done button (after submit / status screens)
  // If not logged in → "Go Back to Login"
  // If logged in → "Back to Profile"
  const doneLabel  = isLoggedIn ? 'Back to Profile' : 'Go Back to Login';
  const handleDone = () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
    } else {
      navigation.goBack();
    }
  };

  const handleUpload = (docId) => {
    Alert.alert(
      'Upload Document',
      'Choose source:',
      [
        { text: 'Cancel',      style: 'cancel' },
        { text: '📷 Camera',   onPress: () => setUploaded(prev => ({ ...prev, [docId]: 'camera' })) },
        { text: '🖼️ Gallery',  onPress: () => setUploaded(prev => ({ ...prev, [docId]: 'gallery' })) },
        { text: '📁 Simulate', onPress: () => setUploaded(prev => ({ ...prev, [docId]: 'simulated' })) },
      ]
    );
  };

  const handleSubmit = () => {
    const missing = requiredDocs.filter(d => !uploaded[d.id]);
    if (missing.length > 0) {
      Alert.alert(
        'Missing Documents',
        `Please upload these required documents:\n\n${missing.map(d => `• ${d.label}`).join('\n')}`
      );
      return;
    }
    Alert.alert(
      'Submit Verification',
      `Your documents will be sent to the ${approver} for review.\n\nAfter submission, please wait for approval before logging in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            submitVerification(activeUser?.id);

            // Push to SocietyContext so SuperAdmin sees it in their dashboard
            if (baseRole === 'admin') {
              addAdminRequest({
                name:           activeUser?.name || '',
                emailOrMobile:  activeUser?.phone || '',
                phone:          activeUser?.phone || '',
                password:       activeUser?.password || '',
                societyName:    activeUser?.society || activeUser?.societyName || '',
                approvalStatus: 'Pending',
              });
            } else if (baseRole === 'builder') {
              addBuilderRequest({
                companyName: activeUser?.company || activeUser?.name || '',
                name:        activeUser?.name || '',
                email:       '',
                phone:       activeUser?.phone || '',
                password:    activeUser?.password || '',
                city:        '',
                reraNumber:  '',
                gst:         '',
                documents:   {},
              });
            }
          },
        },
      ]
    );
  };

  // ── APPROVED ──────────────────────────────────────────────────────────────
  if (verificationStatus === 'approved') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Verification</Text>
          <Text style={styles.headerSub}>{roleLabel}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <View style={[styles.statusCard, { borderColor: P.successBorder }]}>
            <Text style={styles.statusEmoji}>✅</Text>
            <Text style={styles.statusTitle}>Verification Approved!</Text>
            <Text style={styles.statusBody}>
              Your profile has been verified and approved by the{' '}
              <Text style={{ fontWeight: '800', color: P.teal }}>{approver}</Text>.
              You have full access to all features.
            </Text>
            <View style={[styles.badge, { backgroundColor: P.successBg, borderColor: P.successBorder }]}>
              <Text style={[styles.badgeText, { color: P.success }]}>✓ Verified & Approved</Text>
            </View>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>{doneLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PENDING ───────────────────────────────────────────────────────────────
  if (verificationStatus === 'pending' || verificationStatus === 'pending_approval') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Verification</Text>
          <Text style={styles.headerSub}>{roleLabel}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <View style={[styles.statusCard, { borderColor: P.blueBorder }]}>
            <Text style={styles.statusEmoji}>📬</Text>
            <Text style={styles.statusTitle}>Documents Submitted!</Text>
            <Text style={styles.statusBody}>
              Your verification request has been sent to the{' '}
              <Text style={{ fontWeight: '800', color: P.teal }}>{approver}</Text> for review.{'\n\n'}
              Please wait for approval. You will be notified once approved.
            </Text>
            <View style={[styles.badge, { backgroundColor: P.blueBg, borderColor: P.blueBorder }]}>
              <Text style={[styles.badgeText, { color: P.blue }]}>⏳ Waiting for {approver} Approval</Text>
            </View>
            <View style={styles.stepsList}>
              {[
                { label: 'Documents Uploaded',    done: true },
                { label: `${approver} reviewing`, done: false, active: true },
                { label: 'You get notified',      done: false },
                { label: 'Profile activated',     done: false },
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepDot, step.done && styles.stepDotDone, step.active && styles.stepDotActive]}>
                    <Text style={styles.stepDotNum}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, step.done && { color: P.success }, step.active && { color: P.teal, fontWeight: '700' }]}>
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
            {/* Go Back to Login button */}
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>{doneLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── REJECTED ──────────────────────────────────────────────────────────────
  if (verificationStatus === 'rejected') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Verification</Text>
          <Text style={styles.headerSub}>{roleLabel}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.centeredContent}>
          <View style={[styles.statusCard, { borderColor: P.dangerBorder }]}>
            <Text style={styles.statusEmoji}>❌</Text>
            <Text style={styles.statusTitle}>Verification Rejected</Text>
            <Text style={styles.statusBody}>
              Your documents were reviewed by the{' '}
              <Text style={{ fontWeight: '800', color: P.danger }}>{approver}</Text> and could not be approved.{'\n\n'}
              Please upload the correct documents and resubmit.
            </Text>
            <View style={[styles.badge, { backgroundColor: P.dangerBg, borderColor: P.dangerBorder }]}>
              <Text style={[styles.badgeText, { color: P.danger }]}>✗ Rejected — Resubmission Required</Text>
            </View>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: P.danger, marginBottom: 12 }]}
              onPress={() => {
                // Reset store verificationStatus back to not_submitted so form reappears
                useAuthStore.setState(s => ({
                  registeredUsers: s.registeredUsers.map(u =>
                    u.id === activeUser?.id
                      ? { ...u, verificationStatus: 'not_submitted', docsSubmitted: false }
                      : u
                  ),
                  user: s.user?.id === activeUser?.id
                    ? { ...s.user, verificationStatus: 'not_submitted', docsSubmitted: false }
                    : s.user,
                }));
                setUploaded({});
                setFieldValues({});
              }}
            >
              <Text style={styles.doneBtnText}>Resubmit Documents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: '#64748B' }]} onPress={handleDone}>
              <Text style={styles.doneBtnText}>{doneLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── NOT SUBMITTED — show form ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Verification</Text>
        <Text style={styles.headerSub}>{roleLabel}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={[styles.banner, { backgroundColor: P.warningBg, borderColor: P.warningBorder }]}>
          <Text style={[styles.bannerTitle, { color: P.warning }]}>📋 Complete Your Verification</Text>
          <Text style={[styles.bannerBody, { color: P.warning }]}>
            Fill in your details and upload the required documents.
            Your profile will be reviewed by the{' '}
            <Text style={{ fontWeight: '800' }}>{approver}</Text> after submission.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Required documents</Text>
            <Text style={[styles.progressCount, { color: requiredDone === requiredDocs.length ? P.success : P.teal }]}>
              {requiredDone} / {requiredDocs.length}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: `${requiredDocs.length > 0 ? (requiredDone / requiredDocs.length) * 100 : 0}%`,
            }]} />
          </View>
        </View>

        {fields.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Your Details</Text>
            {fields.map(f => (
              <View key={f.id} style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={fieldValues[f.id] || ''}
                  onChangeText={v => setFieldValues(prev => ({ ...prev, [f.id]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={P.textMuted}
                  keyboardType={f.keyboardType || 'default'}
                />
              </View>
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.sectionTitle}>Upload Documents</Text>
          {docs.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              uploaded={!!uploaded[doc.id]}
              onPress={() => handleUpload(doc.id)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit Request for Approval →</Text>
        </TouchableOpacity>

        {/* Back to Login link at bottom */}
        <TouchableOpacity style={styles.backToLoginBtn} onPress={handleDone}>
          <Text style={styles.backToLoginText}>← {doneLabel}</Text>
        </TouchableOpacity>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: P.bg },
  header:          { backgroundColor: P.teal, padding: 20, paddingTop: 20 },
  backBtn:         { marginBottom: 8 },
  backText:        { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' },
  headerTitle:     { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  headerSub:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },

  banner:          { margin: 16, borderRadius: 14, borderWidth: 1, padding: 16 },
  bannerTitle:     { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  bannerBody:      { fontSize: 13, lineHeight: 20 },
  progressCard:    { marginHorizontal: 16, marginBottom: 12, backgroundColor: P.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: P.border },
  progressRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel:   { fontSize: 13, fontWeight: '700', color: P.textSub },
  progressCount:   { fontSize: 13, fontWeight: '800' },
  progressBarBg:   { height: 6, backgroundColor: P.tealMid, borderRadius: 4 },
  progressBarFill: { height: 6, backgroundColor: P.teal, borderRadius: 4 },
  sectionTitle:    { fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 12, marginTop: 4 },
  fieldLabel:      { fontSize: 13, fontWeight: '700', color: P.textSub, marginBottom: 5 },
  fieldInput:      { borderWidth: 1.5, borderRadius: 10, borderColor: P.border, backgroundColor: P.surface, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: P.text },
  docCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: P.surface, borderRadius: 14, borderWidth: 1, borderColor: P.border, padding: 14, marginBottom: 10 },
  docIconBox:      { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  docLabel:        { fontSize: 14, fontWeight: '700', color: P.text, marginBottom: 2 },
  docDesc:         { fontSize: 12, color: P.textMuted, lineHeight: 17 },
  optionalTag:     { fontSize: 11, color: P.teal, fontWeight: '600', marginTop: 2 },
  uploadPill:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  uploadPillText:  { fontSize: 12, fontWeight: '700' },
  submitBtn:       { marginHorizontal: 16, marginTop: 8, backgroundColor: P.teal, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnText:   { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  backToLoginBtn:  { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  backToLoginText: { color: P.teal, fontSize: 14, fontWeight: '700' },

  centeredContent: { flexGrow: 1, padding: 16 },
  statusCard:      { backgroundColor: P.surface, borderRadius: 20, padding: 24, borderWidth: 1, alignItems: 'center' },
  statusEmoji:     { fontSize: 56, marginBottom: 16 },
  statusTitle:     { fontSize: 22, fontWeight: '900', color: P.text, marginBottom: 8, textAlign: 'center' },
  statusBody:      { fontSize: 14, color: P.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  badge:           { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24 },
  badgeText:       { fontSize: 13, fontWeight: '700' },
  stepsList:       { width: '100%', marginBottom: 24 },
  stepRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepDot:         { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepDotDone:     { backgroundColor: P.successBg, borderWidth: 1.5, borderColor: P.success },
  stepDotActive:   { backgroundColor: P.tealSoft, borderWidth: 1.5, borderColor: P.teal },
  stepDotNum:      { fontSize: 11, fontWeight: '800', color: '#64748B' },
  stepText:        { fontSize: 14, color: P.textMuted, flex: 1 },
  doneBtn:         { width: '100%', backgroundColor: P.teal, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 4 },
  doneBtnText:     { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

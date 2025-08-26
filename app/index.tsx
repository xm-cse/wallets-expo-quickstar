import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Redirect } from "expo-router";
import { useCrossmintAuth } from "@crossmint/client-sdk-react-native-ui";
import * as Linking from "expo-linking";
import Balance from "./balance";
import Transfer from "./transfer";
import DelegatedSigners from "./delegated-signer";
import SignMessage from "./sign-message";
import Logout from "./logout";
import Wallet from "./wallet";
import OTPModal from "../components/otp-modal";
import { useOTPVerification } from "../hooks/use-otp-verification";

export default function Index() {
  const { createAuthSession, status } = useCrossmintAuth();
  const url = Linking.useLinkingURL();
  const [activeTab, setActiveTab] = useState<TabKey>("wallet");
  
  // OTP verification hook
  const {
    isVerifyingOTP,
    otpCode,
    isVerifyingCode,
    setOtpCode,
    handleVerifyOTP,
    handleCancelOTP,
  } = useOTPVerification();

  useEffect(() => {
    if (url != null) {
      createAuthSession(url);
    }
  }, [url, createAuthSession]);

  if (status === "initializing") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status === "logged-out") {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.topRow}>
          <View style={styles.iconContainer}>
            <Image
              source={require("../assets/images/crossmint-icon.png")}
              style={styles.icon}
            />
          </View>
          <Logout />
        </View>
        <Wallet />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.card}>
          <TabNavigation
            tabs={TABS}
            activeTab={activeTab}
            onTabPress={(tab) => setActiveTab(tab as TabKey)}
          />

          <View style={styles.scrollContent}>
            {activeTab === "wallet" && <Balance />}
            {activeTab === "transfer" && <Transfer />}
            {activeTab === "signers" && <DelegatedSigners />}
            {activeTab === "sign" && <SignMessage />}
          </View>
        </View>
      </View>
      
      <OTPModal
        visible={isVerifyingOTP}
        otpCode={otpCode}
        isVerifying={isVerifyingCode}
        onOtpCodeChange={setOtpCode}
        onVerifyOTP={handleVerifyOTP}
        onCancel={handleCancelOTP}
      />
    </SafeAreaView>
  );
}

type TabItem = {
  key: string;
  label: string;
};

const TABS: TabItem[] = [
  { key: "wallet", label: "Balance" },
  { key: "transfer", label: "Transfer" },
  { key: "signers", label: "Signers" },
  { key: "sign", label: "Sign" },
];

type TabKey = "wallet" | "transfer" | "signers" | "sign";

function TabNavigation({
  tabs,
  activeTab,
  onTabPress,
}: {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
}) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
          {activeTab === tab.key && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.2,
    shadowRadius: 0.5,
    elevation: 1,
    overflow: "visible",
  },
  scrollContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },

  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
  },
  icon: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tab: {
    paddingVertical: 16,
    marginRight: 24,
    position: "relative",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 8,
  },
  activeTabText: {
    color: "#000",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#62C560",
  },
});

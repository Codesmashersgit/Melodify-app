import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ImageBackground,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");
const CARD_GAP = 14;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

const GENRES = [
  {
    id: "bollywood",
    label: "Bollywood",
    icon: "movie-open",
    image:
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?q=80&w=900",
  },
  {
    id: "hollywood",
    label: "Hollywood",
    icon: "star",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=900",
  },
  {
    id: "punjabi",
    label: "Punjabi",
    icon: "drum",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=900",
  },
  {
    id: "bhojpuri",
    label: "Bhojpuri",
    icon: "music-note",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=900",
  },
  {
    id: "tamil",
    label: "Tamil",
    icon: "temple-hindu",
    image:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=900",
  },
  {
    id: "telugu",
    label: "Telugu",
    icon: "movie-roll",
    image:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=900",
  },
  {
    id: "lofi",
    label: "Lo-Fi / Chill",
    icon: "coffee",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=900",
  },
  {
    id: "hiphop",
    label: "Hip-Hop",
    icon: "microphone",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=900",
  },
  {
    id: "indie",
    label: "Indie",
    icon: "guitar-acoustic",
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=900",
  },
  {
    id: "devotional",
    label: "Devotional",
    icon: "hands-pray",
    image:
      "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=900",
  },
  {
    id: "kpop",
    label: "K-Pop",
    icon: "auto-fix",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=900",
  },
  {
    id: "rock",
    label: "Rock",
    icon: "lightning-bolt",
    image:
      "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=900",
  },
  {
    id: "electronic",
    label: "Electronic",
    icon: "waveform",
    image:
      "https://images.unsplash.com/photo-1571266028243-d220c9c3a7f6?q=80&w=900",
  },
  {
    id: "workout",
    label: "Workout",
    icon: "dumbbell",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900",
  },
  {
    id: "party",
    label: "Party",
    icon: "party-popper",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=900",
  },
  {
    id: "romantic",
    label: "Romantic",
    icon: "heart",
    image:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=900",
  },
];

const PreferencesScreen = ({ navigation }) => {
  const { user, updatePreferences } = useAuth();
  const [selected, setSelected] = useState(user?.preferences || []);
  const insets = useSafeAreaInsets();

  const toggleGenre = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleContinue = async () => {
    await updatePreferences(selected);

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("MainApp");
    }
  };

  const selectedGenres = GENRES.filter((genre) => selected.includes(genre.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#030407" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.replace("MainApp")}
          >
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroTextBox}>
            <Text style={styles.title}>
              What do you <Text style={styles.greenText}>like?</Text>
            </Text>

            <Text style={styles.subtitle}>
              Pick your favorite languages and genres to get better music
              recommendations.
            </Text>

            <View style={styles.badge}>
              <Ionicons name="heart" size={16} color="#41f36b" />
              <Text style={styles.badgeText}>
                {selected.length === 0
                  ? "Select at least one"
                  : `${selected.length} selected`}
              </Text>
            </View>
          </View>

          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600",
            }}
            style={styles.heroImage}
          />
        </View>

        <View style={styles.grid}>
          {GENRES.map((genre) => {
            const isSelected = selected.includes(genre.id);

            return (
              <TouchableOpacity
                key={genre.id}
                activeOpacity={0.86}
                onPress={() => toggleGenre(genre.id)}
                style={[
                  styles.genreCard,
                  isSelected && styles.genreCardSelected,
                ]}
              >
                <ImageBackground
                  source={{ uri: genre.image }}
                  style={styles.genreImage}
                  imageStyle={styles.genreImageStyle}
                >
                  <LinearGradient
                    colors={[
                      "rgba(0,0,0,0.05)",
                      "rgba(0,0,0,0.35)",
                      "rgba(0,0,0,0.95)",
                    ]}
                    style={styles.genreOverlay}
                  >
                    <View style={styles.iconCircle}>
                      <MaterialCommunityIcons
                        name={genre.icon}
                        size={23}
                        color="#fff"
                      />
                    </View>

                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#030407"
                        />
                      </View>
                    )}

                    <Text style={styles.genreLabel}>{genre.label}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footerWrapper, { paddingBottom: insets.bottom + 12 }]}>
        <LinearGradient
          colors={["rgba(14,18,24,0.98)", "rgba(5,7,10,0.98)"]}
          style={styles.footer}
        >
          <View style={styles.selectedInfo}>
            <View style={styles.avatarRow}>
              {selectedGenres.slice(0, 5).map((genre, index) => (
                <Image
                  key={genre.id}
                  source={{ uri: genre.image }}
                  style={[
                    styles.avatar,
                    {
                      marginLeft: index === 0 ? 0 : -10,
                    },
                  ]}
                />
              ))}
            </View>

            <View>
              <Text style={styles.selectedCount}>
                {selected.length} selected
              </Text>
              <Text numberOfLines={2} style={styles.selectedNames}>
                {selected.length === 0
                  ? "Choose your music taste"
                  : selectedGenres.map((item) => item.label).join(", ")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={selected.length === 0}
            onPress={handleContinue}
            style={[
              styles.continueBtn,
              selected.length === 0 && styles.continueBtnDisabled,
            ]}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="chevron-forward" size={22} color="#030407" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030407",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 150,
  },

  topBar: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  circleButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  hero: {
    marginTop: 34,
    minHeight: 185,
    flexDirection: "row",
    alignItems: "center",
  },

  heroTextBox: {
    flex: 1.15,
    zIndex: 2,
  },

  title: {
    color: "#fff",
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  greenText: {
    color: "#35e866",
  },

  subtitle: {
    marginTop: 12,
    color: "#c7c7ce",
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 280,
  },

  badge: {
    marginTop: 20,
    alignSelf: "flex-start",
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  badgeText: {
    color: "#d7d7dc",
    fontSize: 14,
    fontWeight: "600",
  },

  heroImage: {
    width: 145,
    height: 145,
    borderRadius: 72,
    opacity: 0.9,
  },

  grid: {
    marginTop: 26,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },

  genreCard: {
    width: CARD_WIDTH,
    height: 170,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111",
    borderWidth: 1.4,
    borderColor: "rgba(255,255,255,0.14)",
  },

  genreCardSelected: {
    borderColor: "#41f36b",
    shadowColor: "#41f36b",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  genreImage: {
    flex: 1,
  },

  genreImageStyle: {
    borderRadius: 20,
  },

  genreOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  checkCircle: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5cff7d",
    alignItems: "center",
    justifyContent: "center",
  },

  genreLabel: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  footerWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
  },

  footer: {
    minHeight: 104,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  avatarRow: {
    width: 68,
    flexDirection: "row",
    marginRight: 10,
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#101319",
  },

  selectedCount: {
    color: "#41f36b",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },

  selectedNames: {
    color: "#cfd0d4",
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 145,
  },

  continueBtn: {
    height: 58,
    minWidth: 145,
    borderRadius: 30,
    backgroundColor: "#41f36b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#41f36b",
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  continueBtnDisabled: {
    backgroundColor: "#30343b",
    shadowOpacity: 0,
  },

  continueText: {
    color: "#030407",
    fontSize: 17,
    fontWeight: "900",
  },
});

export default PreferencesScreen;
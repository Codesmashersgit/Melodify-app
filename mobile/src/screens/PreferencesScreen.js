import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ImageBackground,
  Dimensions,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";


const { width } = Dimensions.get("window");

const CARD_GAP = 8;
const NUM_COLS = 3;
const CARD_WIDTH = (width - 32 - CARD_GAP * (NUM_COLS - 1)) / NUM_COLS;



const PREFERENCES = [
  { id: 'punjabi', label: 'Punjabi', type: 'Language', icon: 'music-note', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0rFkJzDuJ43OHD639UR8x1yhwRJy6wlNR2oE00MaseA&s=10' },
  { id: 'bhojpuri', label: 'Bhojpuri', type: 'Language', icon: 'music-note', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXhVhVxf6jTHoLpdZphE-ADnAdQljPjIeOpIIMoZWwiw&s' },
  { id: 'marathi', label: 'Marathi', type: 'Language', icon: 'translate', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIGl3BczHAuwknhBQqu3Ao53MFmNhZNsQUFEESMvz0iw&s=10' },
  { id: 'gujarati', label: 'Gujarati', type: 'Language', icon: 'translate', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHoQuATRBPzJ8ucZGS0S8alx40exvSu0kPzRgkZFaguA&s=10' },
  { id: 'bengali', label: 'Bengali', type: 'Language', icon: 'translate', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcex41XtxgxixGsz-teUnDQv_czdGyN5kbm6mXTGWZVw&s=10' },
  { id: 'tamil', label: 'Tamil', type: 'Language', icon: 'translate', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNbqPoSw4r5zHnls0hxbhdPv_tam8X8a6NI_S20SZUBQ&s=10' },
  { id: 'telugu', label: 'Telugu', type: 'Language', icon: 'translate', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9lZEsks-SckMbrivDMEJtCzhUhTs1mnKFNn9nE0_Mzw&s=10' },
  { id: 'rajasthani', label: 'Rajasthani', type: 'Language', icon: 'castle', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDVfSM692qqgcowkF7_UVY3AL44AuXKfVmig6nb7IQaQ&s=10' },
  { id: 'bollywood', label: 'Bollywood', type: 'Genre', icon: 'movie-open', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy4_Sws3rscWdNa0SsNSdu-PHkQcyNWrv-ITDKqhsJiA&s=10' },
  { id: 'hollywood', label: 'Hollywood', type: 'Genre', icon: 'movie-roll', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU8wcZf-xj-kMSrYVN4FWj9lzTzaEbL4-8lwwQ5ZMPGQ&s=10' },
  { id: 'lofi', label: 'Lo-Fi', type: 'Genre', icon: 'headphones', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd7_Cyw-p-dp3vAIoZOs2tl9v0AdwqztgNal2gM3lGJQ&s=10' },
  { id: 'hiphop', label: 'Hip-Hop', type: 'Genre', icon: 'microphone', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRABrYmHSKCXvBS5H-e8RoqDCi59d-Sg4uH_OR19acJKg&s=10' },
  { id: 'indie', label: 'Indie', type: 'Genre', icon: 'guitar-acoustic', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHTSRJlLyB2qAPN-7-1CWuxNWrzLWqHWt8ygkYKGGIcQ&s=10' },
  { id: 'devotional', label: 'Devotional', type: 'Genre', icon: 'hands-pray', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3ZqPi1SzQ0KX6Aav2zvTLqU7NKSkhdE7guXpmNdkqIQ&s=10' },
  { id: 'kpop', label: 'K-Pop', type: 'Genre', icon: 'account-group', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLpW4qjksK6BJwgkoxJAk5be5P3GX0aC-LZiHJaJ6D6A&s=10' },
  { id: 'jazz', label: 'Jazz & Blues', type: 'Genre', icon: 'saxophone', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrEXpNxhcIVRkogEJcyjEmrDNUxOLSoLkOoW3ghltRwQ&s=10' },
  { id: 'classical', label: 'Classical', type: 'Genre', icon: 'violin', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT61DrqlJLFmyAqeW-yrSvpAHcZn4KcHU9tLGIqC8fyYg&s=10' },
  { id: 'sufi', label: 'Sufi', type: 'Genre', icon: 'star-crescent', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPMGHA2Vlqwgx94ije-LcHBiIT4727T-aDkxdhxIYWxg&s=10' },
  { id: 'dance', label: 'Dance/Electronic', type: 'Genre', icon: 'speaker', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrcgEcLqaw-1QEqLSXoKXcG1p5yRGTnNEEHJqhb6BUFw&s=10' },
  { id: 'romantic', label: 'Romantic', type: 'Genre', icon: 'heart', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKjgVZJlk1grzIc8cGdEvDWEr6gLhbusiO4RifZdkzsA&s=10' },
];
const PreferencesScreen = ({ navigation }) => {

  const { user, updatePreferences } = useAuth();

  const [selected, setSelected] = useState(
    user?.preferences || []
  );

  const insets = useSafeAreaInsets();



  const togglePreference = (id) => {

    if (selected.includes(id)) {

      setSelected(
        selected.filter(item => item !== id)
      );

    } else {

      setSelected([
        ...selected,
        id
      ]);

    }

  };



  const handleContinue = async () => {

    await updatePreferences(selected);

    navigation.replace("MainApp");

  };




  return (

    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top
        }
      ]}
    >


      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.7)" translucent={true} />



      <ScrollView

        showsVerticalScrollIndicator={false}

        contentContainerStyle={
          styles.scrollContent
        }

      >



        <View style={styles.topBar}>


          <TouchableOpacity

            style={styles.circleButton}

            onPress={() => navigation.goBack()}

          >

            <Ionicons
              name="arrow-back"
              size={22}
              color="#fff"
            />

          </TouchableOpacity>




          


        </View>





        <View style={styles.header}>


          <Text style={styles.title}>

            Choose your

            <Text style={styles.green}>
              {" "}taste
            </Text>

          </Text>




          <Text style={styles.subtitle}>

            Select languages and music styles you love

          </Text>





          <View style={styles.badge}>


            <Ionicons

              name="heart"

              size={15}

              color="#41f36b"

            />


            <Text style={styles.badgeText}>

              {
                selected.length === 0
                ?
                "Select preferences"
                :
                `${selected.length} selected`
              }

            </Text>


          </View>



        </View>






        <View style={styles.grid}>


          {
            PREFERENCES.map(item => {


              const active =
              selected.includes(item.id);



              return (


                <TouchableOpacity


                  key={item.id}


                  activeOpacity={0.85}


                  onPress={() =>
                    togglePreference(item.id)
                  }


                  style={[
                    styles.card,
                    active &&
                    styles.activeCard
                  ]}


                >




                  <ImageBackground


                    source={{ uri: item.image || 'https://via.placeholder.com/150' }}


                    style={styles.image}


                    imageStyle={
                      styles.imageRadius
                    }


                  >



                    <LinearGradient


                      colors={[
                        "rgba(0,0,0,0.1)",
                        "rgba(0,0,0,0.85)"
                      ]}


                      style={styles.overlay}


                    >




                      <View style={styles.iconBox}>


                        <MaterialCommunityIcons

                          name={item.icon}

                          size={18}

                          color="#fff"

                        />


                      </View>






                      {
                        active &&

                        <View style={styles.check}>


                          <Ionicons

                            name="checkmark"

                            size={15}

                            color="#030407"

                          />


                        </View>

                      }







                      <View>


                        <Text style={styles.cardText}>

                          {item.label}

                        </Text>


                        <Text style={styles.typeText}>

                          {item.type}

                        </Text>


                      </View>




                    </LinearGradient>



                  </ImageBackground>




                </TouchableOpacity>



              );

            })

          }



        </View>



      </ScrollView>





      <View

        style={[
          styles.footerWrapper,
          {
            paddingBottom:
            insets.bottom + 10
          }
        ]}

      >



        <LinearGradient


          colors={[
            "#11151d",
            "#050609"
          ]}


          style={styles.footer}


        >



          <View>


            <Text style={styles.selectedCount}>

              {selected.length} Selected

            </Text>



            <Text style={styles.selectedText}>

              {
                selected.length === 0
                ?
                "Pick your favourites"
                :
                "Music taste saved"
              }

            </Text>


          </View>






          <TouchableOpacity


            disabled={
              selected.length === 0
            }


            onPress={handleContinue}


            style={[
              styles.button,
              selected.length === 0 &&
              styles.disabledButton
            ]}


          >


            <Text style={styles.buttonText}>
              Continue
            </Text>


            <Ionicons

              name="chevron-forward"

              size={20}

              color="#030407"

            />



          </TouchableOpacity>




        </LinearGradient>


      </View>



    </View>

  );

};
const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#030407",
  },


  scrollContent:{
    paddingHorizontal:16,
    paddingBottom:130,
  },


  topBar:{
  marginTop:15,
  flexDirection:"row",
  alignItems:"center",
},


  circleButton:{
    width:46,
    height:46,
    borderRadius:23,
    backgroundColor:"rgba(255,255,255,0.08)",
    alignItems:"center",
    justifyContent:"center",
  },



  header:{
    marginTop:30,
  },


  title:{
    color:"#fff",
    fontSize:38,
    fontWeight:"900",
    letterSpacing:-1,
  },


  green:{
    color:"#41f36b",
  },


  subtitle:{
    marginTop:8,
    color:"#aaa",
    fontSize:15,
    lineHeight:22,
  },


  badge:{
    marginTop:16,
    height:36,
    paddingHorizontal:14,
    borderRadius:18,
    backgroundColor:"rgba(255,255,255,0.07)",
    flexDirection:"row",
    alignItems:"center",
  },


  badgeText:{
    marginLeft:7,
    color:"#ddd",
    fontSize:13,
    fontWeight:"600",
  },


  grid:{
    marginTop:25,
    flexDirection:"row",
    flexWrap:"wrap",
    gap: CARD_GAP,
  },


  card:{
    width:CARD_WIDTH,
    height:120,
    borderRadius:14,
    overflow:"hidden",
    backgroundColor:"#111",
    borderWidth:1,
    borderColor:"rgba(255,255,255,0.10)",
  },


  activeCard:{
    borderColor:"#41f36b",
    borderWidth:1.5,
  },


  image:{
    flex:1,
  },


  imageRadius:{
    borderRadius:16,
  },


  overlay:{
    flex:1,
    padding:10,
    justifyContent:"space-between",
  },


  iconBox:{
    width:34,
    height:34,
    borderRadius:17,
    backgroundColor:"rgba(0,0,0,0.45)",
    justifyContent:"center",
    alignItems:"center",
  },


  check:{
    position:"absolute",
    right:8,
    top:8,
    width:22,
    height:22,
    borderRadius:11,
    backgroundColor:"#41f36b",
    justifyContent:"center",
    alignItems:"center",
  },


  cardText:{
    color:"#fff",
    fontSize:15,
    fontWeight:"900",
  },


  typeText:{
    marginTop:2,
    color:"#ccc",
    fontSize:10,
  },


  footerWrapper:{
    position:"absolute",
    left:14,
    right:14,
    bottom:0,
  },


  footer:{
    minHeight:85,
    borderRadius:25,
    padding:14,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    borderWidth:1,
    borderColor:"rgba(255,255,255,0.1)",
  },


  selectedCount:{
    color:"#41f36b",
    fontSize:15,
    fontWeight:"800",
  },


  selectedText:{
    marginTop:3,
    color:"#aaa",
    fontSize:12,
  },


  button:{
    height:52,
    paddingHorizontal:20,
    borderRadius:26,
    backgroundColor:"#41f36b",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
  },


  disabledButton:{
    backgroundColor:"#30343b",
  },


  buttonText:{
    color:"#030407",
    fontSize:16,
    fontWeight:"900",
    marginRight:5,
  },


});



export default PreferencesScreen;
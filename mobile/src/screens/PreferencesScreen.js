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

const CARD_GAP = 10;
const CARD_WIDTH = (width - 42) / 3;



const PREFERENCES = [

  // LANGUAGES

  {
    id:"hindi",
    label:"Hindi",
    type:"Language",
    icon:"translate",
    image:"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800"
  },

  {
    id:"english",
    label:"English",
    type:"Language",
    icon:"translate",
    image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"
  },

  {
    id:"punjabi",
    label:"Punjabi",
    type:"Language",
    icon:"music-note",
    image:"https://images.unsplash.com/photo-1501386761578-eac5c94b800f?w=800"
  },

  {
    id:"bhojpuri",
    label:"Bhojpuri",
    type:"Language",
    icon:"music-note",
    image:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800"
  },

  {
    id:"marathi",
    label:"Marathi",
    type:"Language",
    icon:"translate",
    image:"https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800"
  },

  {
    id:"gujarati",
    label:"Gujarati",
    type:"Language",
    icon:"translate",
    image:"https://images.unsplash.com/photo-1599661046827-dacde6976549?w=800"
  },

  {
    id:"bengali",
    label:"Bengali",
    type:"Language",
    icon:"translate",
    image:"https://images.unsplash.com/photo-1558431382-27e303142255?w=800"
  },

  {
    id:"tamil",
    label:"Tamil",
    type:"Language",
    icon:"translate",
    image:"https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"
  },

  {
    id:"telugu",
    label:"Telugu",
    type:"Language",
    icon:"translate",
    image:"https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800"
  },

  {
    id:"rajasthani",
    label:"Rajasthani",
    type:"Language",
    icon:"castle",
    image:"https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800"
  },


  // GENRES

  {
    id:"bollywood",
    label:"Bollywood",
    type:"Genre",
    icon:"movie-open",
    image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"
  },

  {
    id:"lofi",
    label:"Lo-Fi",
    type:"Genre",
    icon:"coffee",
    image:"https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800"
  },

  {
    id:"hiphop",
    label:"Hip-Hop",
    type:"Genre",
    icon:"microphone",
    image:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800"
  },

  {
    id:"romantic",
    label:"Romantic",
    type:"Genre",
    icon:"heart",
    image:"https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800"
  },

  {
    id:"party",
    label:"Party",
    type:"Genre",
    icon:"party-popper",
    image:"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"
  },

  {
    id:"devotional",
    label:"Devotional",
    type:"Genre",
    icon:"hands-pray",
    image:"https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800"
  },

  {
    id:"workout",
    label:"Workout",
    type:"Mood",
    icon:"dumbbell",
    image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
  }

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


      <StatusBar
        barStyle="light-content"
        backgroundColor="#030407"
      />



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


                    source={{
                      uri:item.image
                    }}


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
  },


  card:{
    width:CARD_WIDTH,
    height:125,
    marginRight:CARD_GAP,
    marginBottom:CARD_GAP,
    borderRadius:16,
    overflow:"hidden",
    backgroundColor:"#111",
    borderWidth:1,
    borderColor:"rgba(255,255,255,0.12)",
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
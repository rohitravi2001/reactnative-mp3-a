import React, { useState, useEffect } from "react";
import { Platform, View } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { doc, getFirestore,  setDoc } from "firebase/firestore"; 
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, uploadString } from "firebase/storage";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {

  const [eventNameText, setEventNameText] = React.useState("");  
  const [visible, setVisible] = React.useState(false);
  const [eventLocationText, setEventLocationText] = React.useState(""); 
  const [eventDescriptionText, setEventDescriptionText] = React.useState("");
  const [dateButtonText, setDateButtonText] = React.useState("CHOOSE A DATE");
  const [imageButtonText, setImageButtonText] = React.useState("PICK AN IMAGE");
  const [loading, setLoading] = React.useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [image, setImage] = useState("");
  const [dateObject, setDateObject] = useState(0);

  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
     HINTS:

      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.
  
  */

  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/

  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html

  function validateFields() {
    if(eventNameText === "" || eventLocationText === "" || eventDescriptionText === "" || image === "" || dateObject == 0) {
      return false;
    } 
      return true; 
  }

  const saveEvent = async () => {
    // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar.

    // Otherwise, proceed onwards with uploading the image, and then the object.
    let isValid = validateFields();
    
    if(isValid == false) {
      setVisible(true);
      return;
    }

    try {

      // NOTE: THE BULK OF THIS FUNCTION IS ALREADY IMPLEMENTED FOR YOU IN HINTS.TSX.
      // READ THIS TO GET A HIGH-LEVEL OVERVIEW OF WHAT YOU NEED TO DO, THEN GO READ THAT FILE!

      // (0) Firebase Cloud Storage wants a Blob, so we first convert the file path
      // saved in our eventImage state variable to a Blob.

      // (1) Write the image to Firebase Cloud Storage. Make sure to do this
      // using an "await" keyword, since we're in an async function. Name it using
      // the uuid provided below.

      // (2) Get the download URL of the file we just wrote. We're going to put that
      // download URL into Firestore (where our data itself is stored). Make sure to
      // do this using an async keyword.

      // (3) Construct & write the social model to the "socials" collection in Firestore.
      // The eventImage should be the downloadURL that we got from (3).
      // Make sure to do this using an async keyword.
      
      // (4) If nothing threw an error, then go back to the previous screen.
      //     Otherwise, show an error.s
        validateFields();
        setLoading(true);
        console.log("Jokes")
        //const object = await getFileObjectAsync(image);
        const response = await fetch(image);
        const object = await response.blob();
        console.log('Hello')
        const storage = getStorage();
        const uuidNum:string = uuid();
        const storageRef = ref(storage,  uuidNum + ".jpg");
        const db = getFirestore();
        console.log("Hi");
        //const result = await storage.ref().child(uuid() + ".jpg").put(object as Blob);
        uploadBytes(storageRef, object as Blob).then((snapshot) => {
          console.log('Uploaded a blob or file!');
          getDownloadURL(storageRef).then(async (url) => {
            const docs: SocialModel = {
              eventName: eventNameText,
              eventDate: dateObject,
              eventLocation: eventLocationText,
              eventDescription: eventDescriptionText,
              eventImage:  url,
            };
            await setDoc(doc(db, "socials", uuid()), docs);
            setLoading(false);
            navigation.navigate("FeedScreen");
            console.log("Finished social creation.");
            
          })
         
        });
        
    

        //const downloadURL = await result.ref.getDownloadURL();

        //await firebase.firestore().collection("socials").doc().set(doc);
        
    

    } catch (e) {
      console.log("Error while writing social:", e);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result.uri);

    setImage(result.uri);
    
    setImageButtonText('CHANGE IMAGE');
  };

  const Bar = () => {
    return (
      <Appbar.Header style = {{backgroundColor: "#ffffff"}}>
        <Appbar.Action onPress={navigation.goBack} icon="chevron-left" />
        <Appbar.Content  title="Socials" />
      </Appbar.Header>
    );
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  function getFormattedDate(date: Date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return month + '/' + day + '/' + year;
  }

  function formatAMPM(date: Date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds + " " + ampm;
    return strTime;
  }

  const handleConfirm = (date: Date) => {
    setDateButtonText(getFormattedDate(date) + ", " + formatAMPM(date));
    setDateObject(date.getTime());
    hideDatePicker();
  };

  const onDismissSnackBar = () => setVisible(false);

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
      <TextInput style={{marginTop: 30, backgroundColor: "#ffffff"}}  label="Event Name" value={eventNameText} onChangeText={text => setEventNameText(text) }/>
      <TextInput style={{marginTop: 16, backgroundColor: "#ffffff"}}  label="Event Location" value={eventLocationText} onChangeText={text => setEventLocationText(text)}/>
      <TextInput style={{marginTop: 16, backgroundColor: "#ffffff"}}  label="Event Description" value={eventDescriptionText} onChangeText={text => setEventDescriptionText(text)}/>
      <Button style={{marginTop: 40, height: 50, justifyContent: 'center'}}   mode = "outlined" onPress={showDatePicker}> {dateButtonText} </Button>
      <Button style={{marginTop: 20, height: 50, justifyContent: 'center'}}  mode = "outlined" onPress={pickImage}> {imageButtonText} </Button>
      <Button labelStyle={{ color: "black" }} style={{marginTop: 20, height: 50, justifyContent: 'center'}}   loading = {loading} mode = "contained" onPress={saveEvent}> SAVE EVENT </Button>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        
      />
       <Snackbar visible={visible} onDismiss={onDismissSnackBar}> Please fill out all fields! </Snackbar>
      </View>
    </>
  );
}

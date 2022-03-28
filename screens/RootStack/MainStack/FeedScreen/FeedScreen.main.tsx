import React, { useState, useEffect } from "react";
import { View, FlatList, Text } from "react-native";
import { Appbar, Card, Title, Paragraph } from "react-native-paper";
import { doc, onSnapshot, collection, getDocs, getFirestore } from "firebase/firestore";
import {getStorage, ref, getDownloadURL} from "firebase/storage";
import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../../models/social.js";
import { styles } from "./FeedScreen.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../MainStackScreen.js";

/* HOW TYPESCRIPT WORKS WITH PROPS:

  Remember the navigation-related props from Project 2? They were called `route` and `navigation`,
  and they were passed into our screen components by React Navigation automatically.  We accessed parameters 
  passed to screens through `route.params` , and navigated to screens using `navigation.navigate(...)` and 
  `navigation.goBack()`. In this project, we explicitly define the types of these props at the top of 
  each screen component.

  Now, whenever we type `navigation.`, our code editor will know exactly what we can do with that object, 
  and it'll suggest `.goBack()` as an option. It'll also tell us when we're trying to do something 
  that isn't supported by React Navigation! */

interface Props {
  navigation: StackNavigationProp<MainStackParamList, "FeedScreen">;
}

export default function FeedScreen({ navigation }: Props) {
  // TODO: Initialize a list of SocialModel objects in state.
  const [myList, setMyList] = useState<SocialModel[]>([]);
  const db = getFirestore();
  /* TYPESCRIPT HINT: 
    When we call useState(), we can define the type of the state
    variable using something like this:
        const [myList, setMyList] = useState<MyModelType[]>([]); */

  /*
    TODO: In a useEffect hook, start a Firebase observer to listen to the "socials" node in Firestore.
    Read More: https://firebase.google.com/docs/firestore/query-data/listen
  
    Reminders:
      1. Make sure you start a listener that's attached to this node!
      2. The onSnapshot method returns a method. Make sure to return the method
          in your useEffect, so that it's called and the listener is detached when
          this component is killed. 
          Read More: https://firebase.google.com/docs/firestore/query-data/listen#detach_a_listener
      3. You'll probably want to use the .orderBy method to order by a particular key.
      4. It's probably wise to make sure you can create new socials before trying to 
          load socials on this screen.
  */
  //STILL NEED TO IMPLMENT ORDERBY
  useEffect(() => {
      let socials = [];
      const q = (collection(db, "socials"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const docs: SocialModel = {
          eventName: doc.data().eventName,
          eventDate: doc.data().eventDate,
          eventLocation: doc.data().eventLocation,
          eventDescription: doc.data().eventDescription,
          eventImage: doc.data().eventImage,
        };
              socials.push(docs);
        });
        console.log("Current cities in CA: ", socials.join(", "));
        setMyList(socials);
        socials = [];
      });
  
     

      return () => {
        unsubscribe();
      }
  }, [db]);

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


  const renderItem =   ({ item }: { item: SocialModel }) => {
    // TODO: Return a Card corresponding to the social object passed in
    // to this function. On tapping this card, navigate to DetailScreen
    // and pass this ssocial.
    var date = new Date(item.eventDate);
    
   return (  
    <View 
    style={{
     padding: 20
    }}
>
   <Card onPress = {() => navigation.navigate("DetailScreen", {social: item})} containerStyle = {{borderRadius: 10}}>
     <Card.Cover source={{ uri: item.eventImage }} />
     <Card.Content style={{  padding: 10 }}>
      <Title style={styles.h2}>{item.eventDescription}</Title>
      <Paragraph style={styles.body}>{item.eventLocation + " \u2022 " + getFormattedDate(date) +", " + formatAMPM(date)}</Paragraph>
    </Card.Content>
   
      </Card>
      </View>);
      

  }



  const NavigationBar = () => {
    // TODO: Return an AppBar, with a title & a Plus Action Item that goes to the NewSocialScreen.
    return (
      <Appbar.Header style ={{backgroundColor: "#ffffff"}}>
        <Appbar.Content title="Socials" />
        <Appbar.Action icon="plus" onPress={() => {navigation.navigate('NewSocialScreen')}} />
      </Appbar.Header>
    );
  };

  return (
    <>
      <NavigationBar />
      <View style={styles.container}>
      <FlatList
        data={myList}
        renderItem={renderItem}
        keyExtractor={item => item.eventImage}
      />
      </View>
    </>
  );
}

import React, {useState} from 'react';
import { SafeAreaView, ImageBackground, View, FlatList, StyleSheet, Text, StatusBar, Dimensions, Alert } from 'react-native';
import Entry2 from '../components/Entry2';
import axios from 'axios';
import {
    BackgroundStyle,
    StyledContainer2,
    PageTitle,
    ButtonText,
    StyledButtonAppointmentPage
} from '../components/styles';

const Cart = ({ navigation, route }) => {
    const data = route.params;
    const [listing, setListing] = useState([]);
    const [message, setMessage] = useState();
    const [messageType, setMessageType] = useState();

    const handleGetCart = (listingowner) => {
        const url = "https://protected-shelf-96328.herokuapp.com/api/getListing?listingowner=" + listingowner;

        axios
            .get(url)
            .then((response) => {
                const result = response.data;
                const { status, message, data } = result;
                if (status !== 'SUCCESS') {
                    handleMessage(message, status);
                } else {
                    setListing(data[0]);
                }
            })
            .catch((error) => {
                handleMessage('An error occurred. Check your network and try again');
            });
    };

    const handleGetPetownerCart = (petowner) => {
        const url = "https://protected-shelf-96328.herokuapp.com/api/getPetownerBookings?petowner=" + petowner;
        var lst = [];

        axios
            .get(url)
            .then((response) => {
                const result = response.data;
                const { status, message, data } = result;

                if (status !== 'SUCCESS') {
                    handleMessage(message, status);
                } else {
                    // This takes you to each listing
                    for(const listing of data){
                        for(const booking of listing.bookings){
                            booking.reason = listing.listingowner;
                            lst.push(booking);
                        }
                    }

                    var newlst = [];
                    newlst.bookings = lst;
                
                    setListing(newlst);
                }
            })
            .catch((error) => {
                handleMessage('An error occurred. Check your network and try again');
            });
    };

    const handleMessage = (message, type = 'FAILED') => {
        setMessage(message);
        setMessageType(type);
    };

    const WIDTH = Dimensions.get("window").width - 20;
    const SPACING = 20;
    const screenWidth = Dimensions.get("window").width;
    const numColumns = 1;
    const tileSize = screenWidth ;

    /*
     * Handles cancelling booking which updates database
     * Pass in email of listingowner, startdate and enddate of appointment, i.e. listingowner, startdate, enddate
     * dates must be in YYYY/MM/DD format
    */
    const handleCancel = (listingowner, startdate, enddate) => {
        const url = "https://protected-shelf-96328.herokuapp.com/api/cancelBooking";
        var credentials = { listingowner: listingowner, startdate: startdate, enddate: enddate };

        axios
            .put(url, credentials)
            .then((response) => {
                const result = response.data;
                const { status, message, data } = result;

                if (status !== 'SUCCESS') {
                    handleMessage(message, status);
                } else {
                    console.log(route.params.email);
                    if(route.params.accounttype == "Petsitter"){
                        Alert.alert('SUCCESS', 'Your booking has been cancelled.', [
                            {text: 'OK'}
                        ]);
                    } else if(route.params.accounttype == "Petowner"){
                        Alert.alert('SUCCESS', 'Your booking has been cancelled.', [
                            {text: 'OK'}
                        ]);
                    }
                }
            })
            .catch((error) => {
                handleMessage('An error occurred. Check your network and try again');
            });
    }
    
    const handleHandleCancel = (reason, startdate, enddate) => {
        if(route.params.accounttype == "Petsitter"){
            handleCancel(listing.listingowner, startdate, enddate);
        } else if(route.params.accounttype == "Petowner"){
            handleCancel(reason, startdate, enddate);
        }
    }

    const Item = ({ title }) => (
	    <View style={styles.item}>
		    <Text style={styles.title}>{title}</Text>
	    </View>
    );

    if(route.params.accounttype == "Petsitter"){
        handleGetCart(route.params.email);
    } else if(route.params.accounttype == "Petowner"){
        handleGetPetownerCart(route.params.email);
    }

    return (
        <StyledContainer2>
			<ImageBackground
				source={require('./../assets/WallpapersAndLogo/ServicesPage.png')}
				resizeMode="cover"
				style={BackgroundStyle.image}
            >
			</ImageBackground>

			<StatusBar style="light" />
			
			<SafeAreaView style={styles.container}>
				<FlatList
					data={listing.bookings}
					style={{
						margin:5,
						flex: 1
					}}
					contentContainerStyle={{
						padding: SPACING,
                        justifyContent: 'center'
					}}
					
					numColumns={1}
					renderItem={({item}) => {
						return <View>
                            <Entry2 item={item} />
                            <StyledButtonAppointmentPage onPress={() => handleHandleCancel(item.reason, item.startdate, item.enddate)}>
                                <ButtonText>Remove</ButtonText>
                            </StyledButtonAppointmentPage>
                        </View>
					}}
                    ListHeaderComponent = {() => {
                        return <PageTitle>Cart</PageTitle>
                    }}
                    ListFooterComponent = {() => {
                        return <View>
                        <View style={{flex:1}}>
                        <Text style={{fontWeight: "bold", fontSize: 17, alignSelf: 'center'}}>
                            {'Total: ' + item.totalprice}
                        </Text>
                    </View>
                    <StyledButtonAppointmentPage onPress={() => navigation.navigate('UpcomingAppointment', data)}>
                                <ButtonText>Checkout</ButtonText>
                            </StyledButtonAppointmentPage>
                    </View>
                    }}
					keyExtractor={item => item._id}
				/>
			</SafeAreaView>
		</StyledContainer2>    
    );
};

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 5,
		flex: 1,
		marginTop: StatusBar.currentHeight ?  StatusBar.currentHeight : 0,
	},
	item: {
		backgroundColor: '#f9c2ff',
		padding: 20,
		marginVertical: 8,
		marginHorizontal: 16,  
	},
	title: {
		fontSize: 32,
	},
	bgimg: {
		flex: 1,
		justifyContent: "center"
	}
});

export default Cart;
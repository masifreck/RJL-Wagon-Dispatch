import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import React, {useState, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Camera,
  useCameraPermission,
  useCodeScanner,
  useCameraDevice,
} from 'react-native-vision-camera';

import RNRestart from 'react-native-restart';

import NetworkError from './NetworkError';
import NetworkStatus from './NetworkStatus';

import NetInfo from '@react-native-community/netinfo';

import {bgColor, secondaryColor} from './constant';

import Sound from 'react-native-sound';

import styles from './ScannerScreen.css';


// ============================================================================
// SCREEN / DEVICE
// ============================================================================

const wW = Dimensions.get('screen').width;
const wH = Dimensions.get('screen').height;

let isFine;

wW < 400 ? (isFine = true) : (isFine = false);

const Width = Dimensions.get('window').width;


// ============================================================================
// SOUND
// ============================================================================

Sound.setCategory('Playback');


// ============================================================================
// COMPONENT
// ============================================================================

const ScannerScreen = () => {
  const navigation = useNavigation();

  const isConnected = NetworkStatus();


  // ==========================================================================
  // CAMERA PERMISSION
  // KEEPING YOUR EXISTING PERMISSION LOGIC
  // ==========================================================================

  const showAlert = () => {
    Alert.alert(
      'Info',
      'Restart App after Permissions',
      [
        {
          text: 'OK',
          onPress: () => checkAndRequestCameraPermission(),
        },
      ],
      {cancelable: false},
    );
  };


  async function checkAndRequestCameraPermission() {
    console.log(
      'restart kindly===========================================',
    );

    console.log(
      PermissionsAndroid.RESULTS.GRANTED,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );

      if (granted) {
        console.log('Camera permission already granted');

        return PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const requestResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Note : After Accepting, It restarts',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (
          requestResult ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          RNRestart.restart();

          console.log('Camera permission granted');

          console.log(
            'restart kindly===========================================',
          );

          console.log(
            PermissionsAndroid.RESULTS.GRANTED,
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
        } else {
          console.log('Camera permission denied');

          Alert.alert(
            'Permission Denied',
            'You denied camera access. This app requires camera access to function properly.',
            [
              {
                text: 'OK',
                onPress: () => console.log('OK Pressed'),
              },
            ],
            {cancelable: false},
          );
        }

        return requestResult;
      }
    } catch (error) {
      console.error(
        `Error checking/requesting camera permission: ${error}`,
      );

      return PermissionsAndroid.RESULTS.DENIED;
    }
  }


  // ==========================================================================
  // CAMERA
  // ==========================================================================

  const device = useCameraDevice('back');

  const {hasPermission} = useCameraPermission();

  const [cameraActive, setCameraActive] = useState(false);

  const [torchOn, setTorchOn] = useState(false);

  const [littleLoading, setlittleLoading] = useState(false);


  // ==========================================================================
  // LOGIN / USER
  // ==========================================================================

  const [Uid, setUid] = useState('');


  /*
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response =
          await AsyncStorage.getItem('response');

        if (response) {
          setUid(response);
        } else {
          Alert.alert(
            'Error',
            'please login again',
          );

          navigation.navigate('Login');
        }
      } catch (error) {
        console.error(
          'Error retrieving response:',
          error,
        );

        navigation.navigate('Login');
      }
    };

    setTimeout(
      checkLoginStatus,
      3000,
    );
  }, [navigation]);
  */


  // ==========================================================================
  // SCANNED DATA
  // ==========================================================================

  const [ScannedData, setScannedData] =
    useState('');


  // ==========================================================================
  // DISPATCH FORM DATA
  // ==========================================================================

  const [dispatchData, setDispatchData] =
    useState({
      PassNo: '',
      TruckNo: '',
      StackNo: '',
      Transporter: '',
      Destination: '',
      Consignee:'',
      Material: '',
      GrossWt: '',
      TareWt: '',
      netWt: '',
      TpTime: '',
      FromScan: true,
      Branch: '',
    });


  // ==========================================================================
  // API LOADING
  // ==========================================================================

  const [IsLoading, setIsLoading] =
    useState(false);


  // ==========================================================================
  // MODAL
  // ==========================================================================

  const [modalVisible, setModalVisible] =
    useState(false);

  const [textInputValue, setTextInputValue] =
    useState('');


  const handleOpenModal = () => {
    setModalVisible(true);
  };


  const handleCloseModal = () => {
    setModalVisible(false);
  };


  // ==========================================================================
  // SOUND
  // ==========================================================================

  const playTickSound = () => {
    const tick = new Sound(
      require('./assets/sound.mp3'),
      error => {
        if (error) {
          console.log(
            'Failed to load the sound',
            error,
          );

          return;
        }

        tick.play(success => {
          if (!success) {
            console.log(
              'Sound did not play',
            );
          }

          tick.release();
        });
      },
    );
  };


  // ==========================================================================
  // QR DATE CONVERSION
  //
  // QR:
  // Sep  8 2026 12:28PM
  //
  // API:
  // 2026-09-08 12:28:00
  // ==========================================================================

  const convertQRDateToAPI = value => {
    if (!value) {
      return '';
    }

    try {
      const cleanedValue = value
        .replace(/\s+/g, ' ')
        .trim();

      /*
       * JS Date can parse:
       *
       * Sep 8 2026 12:28PM
       *
       * on Android in many cases.
       *
       * We also explicitly handle the format
       * to make the conversion safer.
       */

      const match = cleanedValue.match(
        /^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})(AM|PM)$/i,
      );

      if (match) {
        const monthName = match[1];
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        let hour = parseInt(match[4], 10);
        const minute = parseInt(match[5], 10);
        const ampm = match[6].toUpperCase();

        const months = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        const month =
          months[
            monthName.charAt(0).toUpperCase() +
              monthName.slice(1).toLowerCase()
          ];

        if (month === undefined) {
          return '';
        }

        if (ampm === 'PM' && hour !== 12) {
          hour += 12;
        }

        if (ampm === 'AM' && hour === 12) {
          hour = 0;
        }

        const date = new Date(
          year,
          month,
          day,
          hour,
          minute,
          0,
        );

        if (isNaN(date.getTime())) {
          return '';
        }

        const pad = number =>
          String(number).padStart(2, '0');

        return (
          `${date.getFullYear()}-` +
          `${pad(date.getMonth() + 1)}-` +
          `${pad(date.getDate())} ` +
          `${pad(date.getHours())}:` +
          `${pad(date.getMinutes())}:00`
        );
      }


      // Fallback

      const parsedDate =
        new Date(cleanedValue);

      if (
        isNaN(
          parsedDate.getTime(),
        )
      ) {
        console.log(
          'Unable to parse QR date:',
          value,
        );

        return '';
      }

      const pad = number =>
        String(number).padStart(2, '0');

      return (
        `${parsedDate.getFullYear()}-` +
        `${pad(parsedDate.getMonth() + 1)}-` +
        `${pad(parsedDate.getDate())} ` +
        `${pad(parsedDate.getHours())}:` +
        `${pad(parsedDate.getMinutes())}:00`
      );

    } catch (error) {
      console.log(
        'Date conversion error:',
        error,
      );

      return '';
    }
  };


  // ==========================================================================
  // QR PARSER
  // ==========================================================================

  const parseDispatchQR = qrString => {
    try {
      if (
        !qrString ||
        typeof qrString !== 'string'
      ) {
        return null;
      }


      const parts = qrString
        .split('|')
        .map(item => item.trim());


      console.log(
        '================================',
      );

      console.log(
        'QR TOTAL FIELDS:',
        parts.length,
      );

      console.log(
        'QR PARTS:',
        parts,
      );

      console.log(
        '================================',
      );


      /*
       * Your QR structure:
       *
       * 0  = 14
       * 1  = 7
       * 2  = JODA
       * 3  = 1
       * 4  = L82602534
       * 5  = 2026-10-22
       * 6  = Sep 9 2026 12:28PM
       * 7  = M/S. SUNRISE ASSOCIATES
       * 8  = 312
       * 9  = 071813015621
       * 10 = O.M.C. Ltd.
       * 11 = 3179
       * 12 = WB5
       * 13 = 0
       * 14 = Direct
       * 15 = L82602534/5
       * 16 = 2743
       * 17 = 071813150341
       * 18 = Shivam Iron and Steel Co.Ltd
       * 19 = Destination
       * 20 = NA
       * 21 = 13
       * 22 = Iron
       * 23 = 55
       * 24 = Lumps (CLO)
       * 25 = 63.88
       * 26 = 0.00
       * 27 = 0.00
       * 28 = 0.00
       * 29 = 0.00
       * 30 = 47.480
       * 31 = 15.780
       * 32 = 31.700
       * 33 = OD09Z8146
       * 34 = TR22447/2024
       * 35 = Sep 8 2026 12:28PM
       * 36 = O.M.C. Ltd.
       * 37 = 5-40
       */


      if (parts.length < 36) {
        Alert.alert(
          'Invalid QR data. Fields:',
          parts.length,
        );

        return null;
      }


      // ================================================================
      // CORRECT FIELD MAPPING
      // ================================================================

      const passNo =
        parts[15] || '';

      const stackNo =
        parts[4] || '';

      const branch =
        parts[2] || '';

      const transporter =
        parts[7] || '';
const Consignee= 
parts[18] || '' ;
      const destination =
        parts[19] || '';

      const material =
        parts[24] || '';

      const grossWt =
        parts[31] || '';

      const tareWt =
        parts[32] || '';

      const netWt =
        parts[33] || '';

      const truckNo =
        parts[34] || '';

      const tpQRDateTime =
        parts[6] || '';


      /*
       * Convert QR TP date/time to API format.
       *
       * Display:
       * Sep 8 2026 12:28PM
       *
       * API:
       * 2026-09-08 12:28:00
       */

      const tpTime =
        convertQRDateToAPI(
          tpQRDateTime,
        );


      const parsedData = {

        PassNo:
          passNo,

        TruckNo:
          truckNo,

        StackNo:
          stackNo,

        Transporter:
          transporter,

        Destination:
          destination,
          Consignee: Consignee,

        Material:
          material,

        GrossWt:
          grossWt,

        TareWt:
          tareWt,

        netWt:
          netWt,

        TpTime:
          tpTime,

        FromScan:
          true,

        Branch:
          branch,
      };


      console.log(
        '================================',
      );

      console.log(
        'FINAL PARSED DATA:',
        JSON.stringify(
          parsedData,
          null,
          2,
        ),
      );

      console.log(
        '================================',
      );


      return parsedData;

    } catch (error) {
      console.log(
        'QR parsing error:',
        error,
      );

      return null;
    }
  };


  // ==========================================================================
  // QR PROCESSING LOCK
  // ==========================================================================

  const isProcessingQR =
    useRef(false);


  // ==========================================================================
  // QR SCANNER
  // ==========================================================================

  const codeScanner =
    useCodeScanner({

      codeTypes: ['qr'],

      onCodeScanned: async codes => {

        // Prevent duplicate scans
        if (
          isProcessingQR.current
        ) {
          return;
        }


        const scannedCode =
          codes?.[0]?.value;


        if (!scannedCode) {
          return;
        }


        // Lock scanner
        isProcessingQR.current =
          true;


        try {

          // Sound
          playTickSound();


          // Stop camera
          setCameraActive(false);


          // Show loader
          setlittleLoading(true);


          // Parse QR
          const parsedData =
            parseDispatchQR(
              scannedCode,
            );


          if (!parsedData) {

            Alert.alert(
              'Invalid QR',
              'The scanned QR data is not in the expected format.',
            );

            setScannedData(
              'Invalid QR Data',
            );

            setlittleLoading(false);

            setCameraActive(true);

            isProcessingQR.current =
              false;

            return;
          }


          console.log(
            'Scanned QR:',
            scannedCode,
          );


          console.log(
            'Parsed Dispatch:',
            parsedData,
          );


          // Keep original QR
          setScannedData(
            scannedCode,
          );


          // Fill form
          setDispatchData(
            parsedData,
          );


          setTimeout(() => {

            setlittleLoading(false);

          }, 300);


        } catch (error) {

          console.log(
            'QR Scan Error:',
            error,
          );


          setScannedData(
            'Scan Error!',
          );


          setlittleLoading(false);

          setCameraActive(true);

          isProcessingQR.current =
            false;
        }
      },
    });



  const updateDispatchField = (
    field,
    value,
  ) => {

    setDispatchData(
      previous => ({
        ...previous,
        [field]: value,
      }),
    );
  };


  // ==========================================================================
  // START NEW SCAN
  // ==========================================================================

  const startNewScan = () => {

    isProcessingQR.current =
      false;


    setScannedData('');


    setDispatchData({
      PassNo: '',
      TruckNo: '',
      StackNo: '',
      Transporter: '',
      Destination: '',
      Consignee :'',
      Material: '',
      GrossWt: '',
      TareWt: '',
      netWt: '',
      TpTime: '',
      FromScan: true,
      Branch: '',
    });


    setlittleLoading(false);

    setCameraActive(true);
  };


  // ==========================================================================
  // SAVE DATA API
  // ==========================================================================

const postData = async () => {
  const netState = await NetInfo.fetch();

  // Internet check
  if (!netState.isConnected) {
    Alert.alert(
      'No Internet',
      'Please check your internet connection.',
    );
    return;
  }

  // Scan validation
  if (!ScannedData) {
    Alert.alert(
      'Validation Error',
      'Please scan first.',
    );
    return;
  }

  // Required field validation
  const requiredFields = [
    ['PassNo', 'Pass No'],
    ['TruckNo', 'Vehicle No'],
    ['StackNo', 'Stack No'],
    ['Transporter', 'Transporter'],
    ['Destination', 'Destination'],
    ['Material', 'Material'],
    ['Branch', 'Branch'],
    ['TpTime', 'TP Date & Time'],
  ];

  for (const [field, label] of requiredFields) {
    if (!String(dispatchData[field] ?? '').trim()) {
      Alert.alert(
        'Validation Error',
        `Please enter ${label}.`,
      );
      return;
    }
  }

  try {
    setIsLoading(true);

    // ============================================================
    // CREATE SINGLE RECORD
    // ============================================================

    const payload = {
      PassNo: String(dispatchData.PassNo).trim(),

      TruckNo: String(dispatchData.TruckNo).trim(),

      StackNo: String(dispatchData.StackNo).trim(),

      Transporter: String(
        dispatchData.Transporter,
      ).trim(),

      Destination: String(
        dispatchData.Destination,
      ).trim(),

      Material: String(
        dispatchData.Material,
      ).trim(),

      GrossWt: Number(
        dispatchData.GrossWt,
      ) || 0,

      TareWt: Number(
        dispatchData.TareWt,
      ) || 0,

      netWt: Number(
        dispatchData.netWt,
      ) || 0,

      TpTime: String(
        dispatchData.TpTime,
      ).trim(),

      FromScan: true,

      Branch: String(
        dispatchData.Branch,
      ).trim().toUpperCase(),
    };

    // ============================================================
    // IMPORTANT:
    // API EXPECTS ARRAY
    // ============================================================

    const apiPayload = [payload];

    console.log(
      '======================================',
    );

    console.log(
      'SAVE DATA PAYLOAD:',
      JSON.stringify(
        apiPayload,
        null,
        2,
      ),
    );

    console.log(
      '======================================',
    );

    // ============================================================
    // POST
    // ============================================================

    const response = await fetch(
      'https://rjl.tranzol.com/wagonapiv1/SaveData',
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(apiPayload),
      },
    );

    // ============================================================
    // READ RESPONSE AS TEXT
    // ============================================================

    const result = await response.text();

    console.log(
      'HTTP STATUS:',
      response.status,
    );

    console.log(
      'SAVE API RESPONSE:',
      result,
    );

    // ============================================================
    // SUCCESS / ERROR
    // ============================================================

    const resultLower = result
      .toLowerCase()
      .trim();

    /*
     * The API can return HTTP 200 even when there is an error.
     * Therefore we must inspect the response body too.
     */

    const hasError =
      resultLower.includes('error') ||
      resultLower.includes('exception') ||
      resultLower.includes('unexpected json') ||
      resultLower.includes('failed') ||
      resultLower.includes('invalid') ||
      resultLower.includes('cannot') ||
      resultLower.includes('unable');

    const hasSuccess =
      resultLower.includes('success') ||
      resultLower.includes('saved') ||
      resultLower.includes('save successfully') ||
      resultLower.includes('msuccess');

    // ============================================================
    // SUCCESS
    // ============================================================

    if (response.ok && hasSuccess && !hasError) {
      Alert.alert(
        'Success',
        'Data saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              startNewScan();
            },
          },
        ],
        {
          cancelable: false,
        },
      );

      return;
    }

    // ============================================================
    // API ERROR
    // ============================================================

    let errorMessage = result || 'Unable to save data.';

    if (!response.ok) {
      errorMessage =
        `Server returned status ${response.status}.\n\n${result}`;
    }

    Alert.alert(
      'Save Failed',
      errorMessage,
    );

  } catch (error) {
    console.error(
      'SaveData Error:',
      error,
    );

    Alert.alert(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
    );

  } finally {
    setIsLoading(false);
  }
};


  // ==========================================================================
  // HANDLE SAVE
  // ==========================================================================

  const handlePostRequest = () => {

    postData();

  };


  const renderInput = (
    label,
    field,
    keyboardType = 'default',
    multiline = false,
    editable = false,
  ) => {

    return (

      <View
        style={
          styles.inputContainer
        }>

        <Text
          style={
            styles.inputLabel
          }>

          {label}

        </Text>


        <TextInput

          style={[
            styles.input,

            multiline &&
              styles.multilineInput,

            !editable &&
              styles.readOnlyInput,
          ]}

          value={String(
            dispatchData[field] ??
              '',
          )}

          editable={
            editable
          }

          onChangeText={text => {

            /*
             * Currently fields are read-only.
             *
             * This logic is kept ready for
             * future editable fields.
             */

            if (!editable) {
              return;
            }


            updateDispatchField(
              field,
              text,
            );

          }}

          keyboardType={
            keyboardType
          }

          placeholder={
            `Enter ${label}`
          }

          placeholderTextColor={
            '#999'
          }

          multiline={
            multiline
          }

          textAlignVertical={
            multiline
              ? 'top'
              : 'center'
          }

          selectTextOnFocus={
            editable
          }

        />

      </View>
    );
  };


  // ==========================================================================
  // NO CAMERA VIEW
  // ==========================================================================

  const NoCameraErrorView =
    () => (

      <View
        style={
          styles.noCameraContainer
        }>

        <Text
          style={
            styles.permissionText
          }>

          Allow Camera Permission

        </Text>


        <TouchableOpacity
          style={
            styles.button2
          }
          onPress={
            showAlert
          }>

          <Text
            style={
              styles.text
            }>

            Allow

          </Text>

        </TouchableOpacity>

      </View>
    );


  // ==========================================================================
  // PERMISSION CHECK
  // ==========================================================================

  if (!hasPermission) {

    console.log(
      'Permission denied',
    );

    return (
      <NoCameraErrorView />
    );
  }


  if (device === null) {

    console.log(
      'No camera device found',
    );

    return (
      <NoCameraErrorView />
    );
  }


  // ==========================================================================
  // UI
  // ==========================================================================

  return (

    <>

      <NetworkError />


      <ScrollView

        contentContainerStyle={
          styles.scrollView
        }

        showsVerticalScrollIndicator={
          false
        }>

        {IsLoading ? (

          // ================================================================
          // SAVING LOADER
          // ================================================================

          <View
            style={
              styles.loadingContainer
            }>

            <ActivityIndicator
              animating={true}
              color={bgColor}
              size="large"
            />


            <Text
              style={
                styles.loadingText
              }>

              Saving

            </Text>

          </View>

        ) : (

          <View
            style={
              styles.container
            }>

            {/* ============================================================
                HEADER
            ============================================================ */}

            <View
              style={[
                styles.header,
                {
                  width: Width,
                },
              ]}>

              <View
                style={
                  styles.logoContainer
                }>

                <Image
                  source={
                    require(
                      '../screen/assets/tranzolLogo.png',
                    )
                  }

                  style={
                    styles.logo
                  }
                />


                <Text
                  style={
                    styles.logoText
                  }>

                  Tranzol

                </Text>

              </View>


              <TouchableOpacity

                style={
                  styles.logoutButton
                }

                onPress={() => {

                  Alert.alert(
                    'Sign Out',
                    'Do you want to continue?',
                    [
                      {
                        text: 'Cancel',

                        onPress: () =>
                          console.log(
                            'Cancel Pressed',
                          ),

                        style:
                          'cancel',
                      },

                      {
                        text: 'OK',

                        onPress:
                          async () => {

                            await AsyncStorage.setItem(
                              'response',
                              '',
                            );

                            navigation.replace(
                              'Login',
                            );
                          },
                      },
                    ],

                    {
                      cancelable:
                        true,
                    },
                  );

                }}>

                <Image
                  source={
                    require(
                      '../screen/assets/logout.png',
                    )
                  }

                  style={
                    styles.logoutIcon
                  }
                />

              </TouchableOpacity>

            </View>


            {/* ============================================================
                CAMERA
            ============================================================ */}

            <View
              style={
                styles.cameraContainer
              }>

              {cameraActive ? (

                <>

                  <Camera

                    style={
                      styles.camera
                    }

                    device={
                      device
                    }

                    isActive={
                      cameraActive
                    }

                    codeScanner={
                      codeScanner
                    }

                    torch={
                      torchOn
                        ? 'on'
                        : 'off'
                    }

                    enableZoomGesture={
                      true
                    }

                    /*
                     * Use the camera's neutral zoom
                     * instead of forcing a very low
                     * 0.2 zoom.
                     *
                     * Pinch-to-zoom remains enabled.
                     */

                    zoom={
                      device?.neutralZoom ??
                      1
                    }

                  />


                  {/* QR FRAME */}

                  <View
                    style={
                      styles.frameContainer
                    }>

                    <View
                      style={
                        styles.frame
                      }
                    />

                  </View>


                  {/* TORCH */}

                  <TouchableOpacity

                    style={
                      styles.torchButton
                    }

                    onPress={() =>
                      setTorchOn(
                        previous =>
                          !previous,
                      )
                    }>

                    <Text
                      style={
                        styles.torchText
                      }>

                      {torchOn
                        ? 'Torch Off'
                        : 'Torch On'}

                    </Text>

                  </TouchableOpacity>

                </>

              ) : littleLoading ? (

                // ==========================================================
                // SCAN PROCESSING
                // ==========================================================

                <ActivityIndicator

                  animating={
                    true
                  }

                  color="#000"

                  size="large"

                />

              ) : (

                // ==========================================================
                // FORM AFTER SCAN
                // ==========================================================

                <View
                  style={
                    styles.formWrapper
                  }>

                  <Text
                    style={
                      styles.formTitle
                    }>

                    Dispatch Details

                  </Text>


                  <Text
                    style={
                      styles.formSubtitle
                    }>

                    Scanned data

                  </Text>


                  {/* ======================================================
                      PASS NO
                  ====================================================== */}

                  {renderInput(
                    'Pass No',
                    'PassNo',
                  )}


                  {/* ======================================================
                      VEHICLE NO
                  ====================================================== */}

                  {renderInput(
                    'Vehicle No',
                    'TruckNo',
                  )}


                  {/* ======================================================
                      STACK NO
                  ====================================================== */}

                  {renderInput(
                    'Stack No',
                    'StackNo',
                  )}


                  {/* ======================================================
                      TRANSPORTER
                  ====================================================== */}

                  {renderInput(
                    'Transporter',
                    'Transporter',
                  )}


                  {/* ======================================================
                      DESTINATION
                  ====================================================== */}

                  {renderInput(
                    'Destination',
                    'Destination',
                    'default',
                    true,
                  )}

{renderInput(
  'Consignee',
  'Consignee',
  'default',
  true,
)}
                  {/* ======================================================
                      MATERIAL
                  ====================================================== */}

                  {renderInput(
                    'Material',
                    'Material',
                  )}


                  {/* ======================================================
                      GROSS WEIGHT
                  ====================================================== */}

                  {renderInput(
                    'Gross Weight',
                    'GrossWt',
                    'decimal-pad',
                  )}


                  {/* ======================================================
                      TARE WEIGHT
                  ====================================================== */}

                  {renderInput(
                    'Tare Weight',
                    'TareWt',
                    'decimal-pad',
                  )}


                  {/* ======================================================
                      NET WEIGHT
                  ====================================================== */}

                  {renderInput(
                    'Net Weight',
                    'netWt',
                    'decimal-pad',
                  )}


                  {/* ======================================================
                      TP DATE & TIME
                      READ ONLY
                      NO DATE PICKER
                  ====================================================== */}

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <Text
                      style={
                        styles.inputLabel
                      }>

                      TP Date & Time

                    </Text>


                    <TextInput

                      value={
                        dispatchData.TpTime
                      }

                      editable={
                        false
                      }

                      style={[
                        styles.input,
                        styles.readOnlyInput,
                      ]}

                      placeholder="TP Date & Time"

                      placeholderTextColor={
                        '#999'
                      }

                    />

                  </View>


                  {/* ======================================================
                      BRANCH
                  ====================================================== */}

                  <View
                    style={
                      styles.inputContainer
                    }>

                    <Text
                      style={
                        styles.inputLabel
                      }>

                      Branch

                    </Text>


                    <TextInput

                      value={
                        dispatchData.Branch
                      }

                      editable={
                        false
                      }

                      style={[
                        styles.input,
                        styles.readOnlyInput,
                      ]}

                      placeholder="Branch"

                      placeholderTextColor={
                        '#999'
                      }

                    />

                  </View>


                  {/* ======================================================
                      SCAN AGAIN
                  ====================================================== */}

                  <TouchableOpacity

                    style={
                      styles.scanAgainButton
                    }

                    onPress={
                      startNewScan
                    }>

                    <Text
                      style={
                        styles.scanAgainText
                      }>

                      Scan Again

                    </Text>

                  </TouchableOpacity>

                </View>

              )}

            </View>


            {/* ============================================================
                SAVE BUTTON
            ============================================================ */}

            {!cameraActive &&
              !littleLoading &&
              ScannedData ? (

              <View
                style={
                  styles.saveContainer
                }>

                <TouchableOpacity

                  style={
                    styles.button2
                  }

                  onPress={
                    handlePostRequest
                  }>

                  <Text
                    style={
                      styles.text
                    }>

                    Save

                  </Text>

                </TouchableOpacity>

              </View>

            ) : null}


            {/* ============================================================
                OLD MODAL
            ============================================================ */}

            <Modal

              animationType="slide"

              transparent={true}

              visible={
                modalVisible
              }

              onRequestClose={
                handleCloseModal
              }>

              <View
                style={
                  styles.modalContainer
                }>

                <View
                  style={
                    styles.modalContent
                  }>

                  <TextInput

                    style={
                      styles.textInput
                    }

                    onChangeText={
                      setTextInputValue
                    }

                    value={
                      textInputValue
                    }

                    placeholderTextColor={
                      'black'
                    }

                    placeholder="Enter Code"

                    autoFocus={
                      true
                    }

                  />


                  <View
                    style={
                      styles.buttonContainer
                    }>

                    <View
                      style={
                        styles.button1
                      }>

                      <Button
                        title="Cancel"
                        onPress={
                          handleCloseModal
                        }
                      />

                    </View>


                    <View
                      style={
                        styles.button1
                      }>

                      <Button
                        title="OK"
                        onPress={() =>
                          console.log(
                            'Modal OK',
                          )
                        }
                      />

                    </View>

                  </View>

                </View>

              </View>

            </Modal>

          </View>

        )}

      </ScrollView>

    </>

  );
};


export default ScannerScreen;
import {
  StyleSheet,
  Dimensions,
} from 'react-native';

import {
  bgColor,
  secondaryColor,
} from './constant';


const wW =
  Dimensions.get('screen').width;

const wH =
  Dimensions.get('screen').height;

const isFine =
  wW < 400;


const styles = StyleSheet.create({

  // ========================================================================
  // MAIN
  // ========================================================================

  scrollView: {
    flexGrow: 1,
    backgroundColor: 'white',
  },


  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 30,
  },


  // ========================================================================
  // HEADER
  // ========================================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: 70,

    paddingHorizontal: 20,

    marginTop: 20,

    marginBottom: 10,
  },


  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  logo: {
    width: 50,
    height: 50,

    resizeMode: 'contain',
  },


  logoText: {
    fontWeight: '900',

    fontSize:
      isFine
        ? 18
        : 20,

    color: secondaryColor,

    marginLeft: 8,
  },


  logoutButton: {
    width: 42,
    height: 42,

    alignItems: 'center',
    justifyContent: 'center',
  },


  logoutIcon: {
    width: 30,
    height: 30,

    tintColor:
      secondaryColor,
  },


  // ========================================================================
  // CAMERA
  // ========================================================================

  cameraContainer: {
    width: '90%',

    minHeight: 350,

    backgroundColor: '#d8e2dc',

    borderRadius: 14,

    elevation: 5,

    overflow: 'hidden',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 5,

    marginBottom: 20,
  },


  camera: {
    ...StyleSheet.absoluteFillObject,
  },


  // ========================================================================
  // QR FRAME
  // ========================================================================

  frameContainer: {
    position: 'absolute',

    top: '15%',
    left: 0,

    width: '100%',
    height: '70%',

    alignItems: 'center',
    justifyContent: 'center',
  },


  frame: {
    width:
      isFine
        ? 210
        : 250,

    height:
      isFine
        ? 210
        : 250,

    borderColor:
      secondaryColor,

    borderWidth: 3,

    borderRadius: 12,
  },


  // ========================================================================
  // TORCH
  // ========================================================================

  torchButton: {
    position: 'absolute',

    bottom: 15,

    alignSelf: 'center',

    backgroundColor:
      'rgba(255,255,255,0.90)',

    paddingHorizontal: 18,
    paddingVertical: 9,

    borderRadius: 20,

    elevation: 3,
  },


  torchText: {
    color: '#111',

    fontSize: 13,

    fontWeight: '700',
  },


  // ========================================================================
  // FORM
  // ========================================================================

  formWrapper: {
    width: '100%',

    paddingHorizontal: 16,

    paddingTop: 16,

    paddingBottom: 20,
  },


  formTitle: {
    color: secondaryColor,

    fontSize: 19,

    fontWeight: '900',

    marginBottom: 3,
  },


  formSubtitle: {
    color: '#777',

    fontSize: 12,

    marginBottom: 18,
  },


  // ========================================================================
  // INPUT
  // ========================================================================

  inputContainer: {
    width: '100%',

    marginBottom: 14,
  },


  inputLabel: {
    color: '#343434',

    fontSize: 12,

    fontWeight: '700',

    marginBottom: 6,

    marginLeft: 2,
  },


  input: {
    width: '100%',

    minHeight: 48,

    borderWidth: 1,

    borderColor: '#d5d5d5',

    backgroundColor: '#fff',

    borderRadius: 9,

    paddingHorizontal: 13,

    paddingVertical: 10,

    color: '#222',

    fontSize: 14,

    elevation: 1,
  },


  multilineInput: {
    minHeight: 75,

    maxHeight: 130,
  },


  // ========================================================================
  // DATE
  // ========================================================================

  dateInput: {
    width: '100%',

    minHeight: 48,

    borderWidth: 1,

    borderColor: '#d5d5d5',

    backgroundColor: '#fff',

    borderRadius: 9,

    paddingHorizontal: 13,

    justifyContent: 'center',

    elevation: 1,
  },


  dateText: {
    color: '#222',

    fontSize: 14,
  },


  placeholderText: {
    color: '#999',

    fontSize: 14,
  },


  // ========================================================================
  // BRANCH
  // ========================================================================

  disabledInput: {
    width: '100%',

    minHeight: 48,

    borderWidth: 1,

    borderColor: '#dedede',

    backgroundColor: '#f2f3f4',

    borderRadius: 9,

    paddingHorizontal: 13,

    justifyContent: 'center',
  },


  disabledText: {
    color: '#555',

    fontSize: 14,

    fontWeight: '700',
  },


  // ========================================================================
  // SCAN AGAIN
  // ========================================================================

  scanAgainButton: {
    height: 44,

    borderWidth: 1,

    borderColor: bgColor,

    borderRadius: 9,

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 5,

    marginBottom: 5,
  },


  scanAgainText: {
    color: bgColor,

    fontSize: 13,

    fontWeight: '800',

    textTransform: 'uppercase',

    letterSpacing: 1,
  },


  // ========================================================================
  // SAVE
  // ========================================================================

  saveContainer: {
    width: '100%',

    alignItems: 'center',

    paddingHorizontal: 16,

    marginBottom: 20,
  },


  button2: {
    backgroundColor: bgColor,

    borderRadius: 10,

    height: 50,

    width: '100%',

    alignItems: 'center',

    justifyContent: 'center',

    elevation: 4,
  },


  text: {
    color: '#ffffff',

    textAlign: 'center',

    fontSize: 14,

    letterSpacing: 2,

    textTransform: 'uppercase',

    fontWeight: '900',
  },


  // ========================================================================
  // LOADING
  // ========================================================================

  loadingContainer: {
    flex: 1,

    minHeight:
      wH * 0.8,

    justifyContent: 'center',

    alignItems: 'center',
  },


  loadingText: {
    color: secondaryColor,

    textAlign: 'center',

    fontSize: 15,

    textTransform: 'uppercase',

    fontWeight: '700',

    marginTop: 8,

    letterSpacing: 2,
  },


  // ========================================================================
  // CAMERA PERMISSION
  // ========================================================================

  noCameraContainer: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: 'white',
  },


  permissionText: {
    color: secondaryColor,

    textAlign: 'center',

    fontSize:
      isFine
        ? 13
        : 15,

    textTransform: 'uppercase',

    fontWeight: '700',

    marginTop: 5,

    letterSpacing: 1,
  },


  // ========================================================================
  // MODAL
  // ========================================================================

  modalContainer: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor:
      'rgba(0, 0, 0, 0.5)',
  },


  modalContent: {
    backgroundColor: '#fff',

    padding: 20,

    borderRadius: 10,

    width: '80%',

    alignItems: 'center',
  },


  textInput: {
    borderWidth: 1,

    borderColor: '#ccc',

    padding: 10,

    borderRadius: 5,

    width: '100%',

    marginBottom: 20,

    color: 'black',
  },


  buttonContainer: {
    flexDirection: 'row',

    justifyContent:
      'space-around',

    width: '100%',
  },


  button1: {
    width: '40%',
  },

});

export default styles;
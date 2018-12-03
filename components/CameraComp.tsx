import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Permissions, ImagePicker, Camera } from 'expo';
import {
  TouchableOpacity, Image, View, Text, StyleSheet,
} from 'react-native';
import { ButtonGroup } from 'react-native-elements';

import Results from './Results';
import PlacesToRecycle from './PlacesToRecycle';

const ButtonGroupModeSelection = ({ updateIndex, inputModeIndex }) => {
  return (
    <ButtonGroup
      selectedBackgroundColor="#8e3080"
      onPress={updateIndex}
      selectedIndex={inputModeIndex}
      buttons={['Take Picture', 'Gallery', 'Search']}
      containerStyle={{ height: 40, margin: 0, padding: 0 }} />
  )
};

interface Props {
  foundMaterials?: object[];
};

interface State {
  hasCameraPermission: boolean | undefined;
  type: string;
  image: string;
  loading: boolean;
  inputModeIndex: number;
};

class CameraComp extends Component<Props, State> {
  constructor(props, context?: any) {
    super(props, context);
    this.state = {
      hasCameraPermission: undefined,
      type: Camera.Constants.Type.back,
      image: '',
      loading: true,
      inputModeIndex: 0,
    };
  };

  public updateIndex = (inputModeIndex: number) => { this.setState({ inputModeIndex }) };

  public async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA).then(() =>
      Permissions.askAsync(Permissions.CAMERA_ROLL)
    );
    this.setState({ hasCameraPermission: status === 'granted' });
  };

  public takePic = async () => {
    const permissions = Permissions.CAMERA_ROLL;
    const permission = Permissions.CAMERA;
    const part1 = await Permissions.askAsync(permissions);
    const part2 = await Permissions.askAsync(permission);
    console.log(permissions, part1.status);
    if (part1.status === 'granted' && part2.status === 'granted') {
      let image = await ImagePicker.launchCameraAsync({ base64: true });
      if (image.cancelled === false) {
        console.log(Object.keys(image));
        this.setState({ image: image.base64, loading: false });
      }
    }
  };

  public pickImage = async () => {
    const permissions = Permissions.CAMERA_ROLL;
    const { status } = await Permissions.askAsync(permissions);
    console.log(permissions, status);
    if (status === 'granted') {
      let image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        aspect: [4, 3],
        base64: true,
      });
      if (image.cancelled === false) {
        console.log(Object.keys(image));
        this.setState({ image: image.base64, loading: false });
      }
    }
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (this.state.loading === false) {
      return <Results image={this.state.image} />;
    };
    if (hasCameraPermission === undefined) {
      return <Text>Get permission to Camera</Text>;
    };
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    };
    // if (this.props.foundMaterials.length >= 1) {
    //   return (
    //     <View style={styles.blankContainer}>
    //       <ButtonGroupModeSelection updateIndex={this.updateIndex} inputModeIndex={this.state.inputModeIndex} />
    //     </View>
    //   )
    // };

    return (
      <View>
        <View
          style={styles.container}>
          {
            this.state.inputModeIndex === 0 ?
              <TouchableOpacity onPress={() => this.takePic()}>
                <Image
                  style={styles.camera} source={require('../images/green-camera-icon.png')}
                />
              </TouchableOpacity>
              : this.state.inputModeIndex === 1 ?
                <TouchableOpacity onPress={() => this.pickImage()}>
                  <Image
                    style={styles.camera}
                    source={require('../images/green-folder-icon.png')}
                  />
                </TouchableOpacity>
                : <PlacesToRecycle />
          }
        </View>
        <ButtonGroupModeSelection updateIndex={this.updateIndex} inputModeIndex={this.state.inputModeIndex} />
      </View>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 150,
    margin: 0,
    padding: 0,
  },
  blankContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 50,
    margin: 0,
    padding: 0,
  },
  camera: {
    padding: 0,
    margin: 0,
    width: 150,
    height: 150,
  },
});

const mapStateToProps = ({ where, materials }) => {
  console.log('THIS IS FROM THE CameraComp COMPONENT', materials.foundMaterials)
  return {
    where,
    foundMaterials: materials.foundMaterials,
    materialDetails: materials.materialDetails,
  };
};

export default connect(mapStateToProps)(CameraComp);

import React, { Component } from 'react';
import Moment from 'react-moment';
import 'moment-timezone';
import axios from 'axios';
import jsonp from 'jsonp';
import clearDayPic from './pics/clearDay.jpeg';
import clearNightPic from './pics/clearNight.jpeg';
import cloudyPic from './pics/cloudy.jpeg';
import fogPic from './pics/fog.jpg';
import rainPic from './pics/rain.jpeg';
import './App.css';

var dateFormat = require('dateformat');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: null,
      geolocationError: null,
      geocodeData: {},
      darkskyData: {},
    }
  }

  getNecessaryState = () => {
    // Get user's latitude & longitude.
    let geolocationOptions = {
      enableHighAccuracy: false,
      maximumAge: Infinity,
      timeout: 60 * 1000,
    };
    this.setState({geolocationError: null});
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("geolocation done.");
      this.setState({position});

      // Find out user's city and province using their location.
      const geocodeAPI = 'https://geocoder.ca/?latt=' + this.state.position.coords.latitude + '&longt=' + this.state.position.coords.longitude + '&reverse=1&allna=1&geoit=xml&corner=1&json=1'
      axios.get(geocodeAPI)
        .then((data) => {
          console.log("geocoder done.");
          this.setState({geocodeData: data});
        })
        .catch((error) => {
          console.log(error);
        });

      // Find out weather forecast at user's location.
      const darkskyAPI = 'https://api.darksky.net/forecast/692d3c4de18e7bd2351e3fb7dbbfb03d/' + this.state.position.coords.latitude + ',' + this.state.position.coords.longitude;
      // To get around this error: No 'Access-Control-Allow-Origin' header is present on the requested resource.
      jsonp(darkskyAPI, null, (err, data) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log("darksky done.");
          this.setState({darkskyData: data});
          console.log(data.currently.time);
          console.log(data.currently.temperature);
          console.log(data.currently.summary);
        }
      });
    },
    (error) => {
      this.setState({geolocationError: error});
      console.log(error);
    },
    geolocationOptions);
  };

  componentWillMount() {
    this.getNecessaryState();
  }

  getIcon = (hourlyData) => {
    let icon = null;
    switch (hourlyData.icon) {
      case 'clear-day':
        icon = <i className="wi wi-day-sunny"></i>;
        break;
      case 'clear-night':
        icon = <i className="wi wi-night-clear"></i>;
        break;
      case 'rain':
        icon = <i className="wi wi-raindrops"></i>;
        break;
      case 'snow':
        icon = <i className="wi wi-snow"></i>;
        break;
      case 'sleet':
        icon = <i className="wi wi-sleet"></i>;
        break;
      case 'wind':
        icon = <i className="wi wi-strong-wind"></i>;
        break;
      case 'fog':
        icon = <i className="wi wi-fog"></i>;
        break;
      case 'cloudy':
      case 'partly-cloudy-day':
      case 'partly-cloudy-night':
        icon = <i className="wi wi-cloudy"></i>;
        break;
      default:
        icon = <i className="wi wi-na"></i>;
    }
    return icon;
  };

  getBackgroundImageUrl = (description) => {
    let styleObj = {
       backgroundImage: 'none',
       backgroundRepeat  : 'no-repeat',
    }
    switch (description) {
      case 'clear-day':
        styleObj.backgroundImage = "url(" + clearDayPic + ")";
        styleObj.backgroundPosition = "center center";
        break;
      case 'clear-night':
        styleObj.backgroundImage = "url(" + clearNightPic + ")";
        styleObj.backgroundPosition = "bottom center";
        break;
      case 'rain':
        styleObj.backgroundImage = "url(" + rainPic + ")";
        styleObj.backgroundPosition = "bottom center";
        break;
      case 'snow':
        break;
      case 'sleet':
        break;
      case 'wind':
        break;
      case 'fog':
        styleObj.backgroundImage = "url(" + fogPic + ")";
        styleObj.backgroundPosition = "50% 65%";
        break;
      case 'cloudy':
      case 'partly-cloudy-day':
      case 'partly-cloudy-night':
        styleObj.backgroundImage = "url(" + cloudyPic + ")";
        styleObj.backgroundPosition = "bottom center";
        break;
      default:;
    }
    return styleObj;
  };

  render() {
    if (this.state.geolocationError !== null) {
      return (
        <h1 className='top-header'>
            Error in getting your lattitude and longitude.<br/>
            Please do not block the app from getting your location.<br/>
            We do not share your location with anyone.
        </h1>
      );
    }
    if (this.state.position === null) {
      return <h1 className='top-header'>Getting your lattitude and longitude. Please be patient.</h1>;
    }
    if (this.state.darkskyData.hourly === undefined || this.state.geocodeData.data === undefined) {
      return null;
    }

    let tableRows = []
    for (let index = 0; index < 5; index++) {
      const obj = this.state.darkskyData.hourly.data[index];
      const momentObj =
        <Moment unix tz={this.state.geocodeData.data.TimeZone} format="ddd, MMM Do, ha" element="span">
          {parseInt(obj.time, 10)}
        </Moment>;
      tableRows.push(
        <tr key={index}>
          <td className='secondary-info-row table-time'>{momentObj}</td>
          <td className='secondary-info-row table-icon'>{this.getIcon(obj)}</td>
          <td className='secondary-info-row table-temp'>{Math.floor(obj.temperature)}&deg;F</td>
        </tr>
      );
    }
  
    return (
      <div className="flex-box">       
        <div className="container text-center weather-main" style={this.getBackgroundImageUrl(this.state.darkskyData.currently.icon)}>
          <p className="summary">{this.state.darkskyData.currently.summary}</p>
          <p className="city">{this.state.geocodeData.data.city} {this.state.geocodeData.data.prov}</p>
          <p className="temperature">{Math.floor(this.state.darkskyData.currently.temperature)}&deg;F</p>
        </div>
        <div className="container weather-secondary">
          <p className="hourly-tab">Hourly Weather</p>
          <table className="secondary-info table">
            <tbody>{tableRows}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;

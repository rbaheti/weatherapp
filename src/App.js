import React, { Component } from 'react';
import Moment from 'react-moment';
import axios from 'axios';
import jsonp from 'jsonp';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: {},
      city: '',
      prov: '',
      darkskyData: {},
    }
  }

  getNecessaryState = () => {
    // Get user's latitude & longitude.
    let geolocationOptions = {
      enableHighAccuracy: false,
      maximumAge: Infinity,
    };
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({position});

      // Find out user's city and province using their location.
      const geocodeAPI = 'https://geocoder.ca/?latt=' + this.state.position.coords.latitude + '&longt=' + this.state.position.coords.longitude + '&reverse=1&allna=1&geoit=xml&corner=1&json=1'
      axios.get(geocodeAPI)
        .then((data) => {
          this.setState({city: data.data.city, prov: data.data.prov});
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
          this.setState({darkskyData: data});
          console.log(data.currently.time);
          console.log(data.currently.temperature);
          console.log(data.currently.summary);
        }
      });
    },
    (error) => {
      console.log(error);
    },
    geolocationOptions);
  };

  componentWillMount() {
    this.getNecessaryState();
  }

  getIcon = (hourlyData) => {
    let icon = hourlyData.icon;
      switch (icon) {
        case 'clear-day':
          icon = `<i class="wi wi-day-sunny"></i>`;
          break;
        case 'clear-night':
          icon = `<i class="wi wi-night-clear"></i>`;
          break;
        case 'rain':
          icon = `<i class="wi wi-raindrops"></i>`;
          break;
        case 'snow':
          icon = `<i class="wi wi-snow"></i>`;
          break;
        case 'sleet':
          icon = `<i class="wi wi-sleet"></i>`;
          break;
        case 'wind':
          icon = `<i class="wi wi-strong-wind"></i>`;
          break;
        case 'fog':
          icon = `<i class="wi wi-fog"></i>`;
          break;
        case 'cloudy':
        case 'partly-cloudy-day':
        case 'partly-cloudy-night':
          icon = `<i class="wi wi-cloudy"></i>`;
          break;
        default:
          icon = `<i class="wi wi-na"></i>`;
      }
      return icon;
  }

  render() {
    let tableElem = null;
    if (this.state.darkskyData.hourly !== undefined) {
      tableElem = <table className="secondary-info table">
          <tbody>
            {this.state.darkskyData.hourly.data.map(function(obj, index) {
                    console.log("obj.time: " + parseInt(obj.time));
                    return (<tr key={index}>
                      <td className='secondary-info-row table-time'><Moment unix format="ddd H:MM A">{obj.time}</Moment></td>
                      <td className='secondary-info-row table-icon'>{this.getIcon(obj)}</td>
                      <td className='secondary-info-row table-temp'>{obj.temperature}&deg;F</td>
                    </tr>);
                  })
            }
            <tr><td>latitude</td><td>{this.state.position.coords.latitude}</td></tr>
            <tr><td>latitude</td><td>{this.state.position.coords.longitude}</td></tr>
            <tr><td>city</td><td>{this.state.city}</td></tr>
            <tr><td>prov</td><td>{this.state.prov}</td></tr>
          </tbody>
        </table>;
    }

    return (
      <div className="flex-box">        
        <div className="container text-center weather-main">
          <p className="time"></p>
          <p className="summary"></p>
          <p className="city"></p>
          <p className="temperature"></p>
        </div>
        <div className="container weather-secondary">
          <p className="hourly-tab"></p>
          {tableElem}
        </div>
      </div>
    );
  }
}

export default App;

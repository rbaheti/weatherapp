import React, { Component } from 'react';
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
    }
  }

  componentWillMount() {
    let geolocationOptions = {
      enableHighAccuracy: false,
      maximumAge: Infinity,
    };
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({position});

      const geocodeAPI = 'https://geocoder.ca/?latt=' + this.state.position.coords.latitude + '&longt=' + this.state.position.coords.longitude + '&reverse=1&allna=1&geoit=xml&corner=1&json=1'
      axios.get(geocodeAPI)
        .then((data) => {
          this.setState({city: data.data.city, prov: data.data.prov});
        })
        .catch((error) => {
          console.log(error);
        });

      const darkskyAPI = 'https://api.darksky.net/forecast/692d3c4de18e7bd2351e3fb7dbbfb03d/' + this.state.position.coords.latitude + ',' + this.state.position.coords.longitude;
      // To get around this error: No 'Access-Control-Allow-Origin' header is present on the requested resource.
      jsonp(darkskyAPI, null, function (err, data) {
        if (err) {
          console.error(err.message);
        } else {
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
    /*const postDataEndpoint = 'http://localhost:3030/posts';
    const postData = axios.get(postDataEndpoint);
    return {
      type: SET_POST_DATA,
      payload: postData,
    };*/
  }

  render() {
    let tableElem = null;
    if (this.state.position.coords !== undefined) {
      tableElem = <table>
          <tbody>
            <tr><td>latitude</td><td>{this.state.position.coords.latitude}</td></tr>
            <tr><td>latitude</td><td>{this.state.position.coords.longitude}</td></tr>
            <tr><td>city</td><td>{this.state.city}</td></tr>
            <tr><td>prov</td><td>{this.state.prov}</td></tr>
          </tbody>
        </table>;
    }

    return (
      <div className="flex-box">
        {tableElem}
        <div className="container text-center weather-main">
          <p className="time"></p>
          <p className="summary"></p>
          <p className="city"></p>
          <p className="temperature"></p>
        </div>
        <div className="container weather-secondary">
          <p className="hourly-tab"></p>
          <table className="secondary-info table">
            <tbody>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;

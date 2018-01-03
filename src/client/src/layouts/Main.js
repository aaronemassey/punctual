import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

class Main extends React.Component {
    // plan to get isLoggedIn status from fetching firebase auth data
  constructor(props){
    super(props);

    this.state = {isLoggedIn: !!  document.cookie};
    this.onClick = this.handleLoginStatusChange.bind(this);
  }

  handleLoginStatusChange(e){
    e.preventDefault();
    this.setState({
        isLoggedIn: !document.cookie
    })
    console.log(!this.state.isLoggedIn);
  }
  render() {
    return (
      <div className="content-wrapper">
          <NavBar isLoggedIn = {this.state.isLoggedIn}/>
          {React.cloneElement( this.props.children, {isLoggedIn: this.state.isLoggedIn, changeStatus: this.onClick } )}
          <Footer />
      </div>
    );
  }
}
Main.propTypes = {
  
};
export default Main;
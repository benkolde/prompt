import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Text, Dimensions, AsyncStorage, Keyboard } from 'react-native'
import { Button, Card, InputItem, WhiteSpace } from 'antd-mobile'
import { graphql, compose } from 'react-apollo'
import { emailChanged, passwordChanged } from '../actions'
import loginUserMutation from '../mutations/loginUser'

const WIDTH = Dimensions.get('window').width
const MARGIN = 60

class LoginForm extends Component {
  state = {
    error: ''
  }

  onEmailChange = text => {
    this.props.emailChanged(text)
  }

  onPasswordChange = text => {
    this.props.passwordChanged(text)
  }

  onLoginButtonPress = () => {
    const { email, password } = this.props

    if (this.validateInput(email, password)) {
      this.loginUser(email, password)
    }
  }

  validateInput = (email, password) => {
    if (!email && !password) {
      this.setState({ error: 'Please enter an email and password.' })
      return false
    } else if (!email) {
      this.setState({ error: 'Please enter a valid email.' })
      return false
    } else if (!password) {
      this.setState({ error: 'Please enter a password.' })
      return false
    }
    this.setState({ error: '' })
    return true
  }

  loginUser = (email, password) => {
    const input = { email: { email, password } }

    Keyboard.dismiss()
    this.setState({ loading: true })
    this.props.mutate({ variables: input })
      .then(data => {
        AsyncStorage.setItem('token', data.data.signinUser.token)
        AsyncStorage.setItem('loggedInUserId', data.data.signinUser.user.id)
        this.props.navigation.navigate('main')
        this.setState({ loading: false })
        this.props.emailChanged('')
        this.props.passwordChanged('')
      })
      .catch(err => {
        console.log('Error logging in', err) // eslint-disable-line no-console
        this.setState({ loading: false })
      })
  }

  render() {
    return (
      <Card style={{ width: WIDTH - MARGIN, margin: MARGIN }}>
        <Card.Header
          title='Login'
        />

        <Card.Body>
          <InputItem
            type='text'
            placeholder='Email'
            onChange={phone => this.props.emailChanged(phone)}
            value={this.props.email}
            error={this.state.error.toLowerCase().indexOf('email') >= 0}
          />

          <WhiteSpace />

          <InputItem
            type='password'
            placeholder='Password'
            onChangeText={this.onPasswordChange}
            value={this.props.password}
            error={this.state.error.toLowerCase().indexOf('password') >= 0}
          />

          <Text style={{ fontSize: 18, color: 'red', alignSelf: 'center' }}>
            {this.state.error}
          </Text>

          <Button
            primary
            loading={this.state.loading}
            onClick={this.onLoginButtonPress}
            style={{ margin: 15 }}
          >
            Login
          </Button>
        </Card.Body>
      </Card>
    )
  }
}

const mapStateToProps = state => ({
  email: state.auth.email,
  password: state.auth.password,
  username: state.auth.username,
  error: state.auth.error
})

export default compose(
  graphql(loginUserMutation),
  connect(mapStateToProps, { emailChanged, passwordChanged })
)(LoginForm)

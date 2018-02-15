require('dotenv').config();
import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  TouchableHighlight
} from 'react-native'
import { Constants, AppLoading, Font } from 'expo'
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons'


export default class App extends React.Component {

  state = {
    fontLoaded: false,
    loaded: false,
    data: null,
    comments: []
  }

  componentDidMount() {
    this.fetchFeed()
    Font.loadAsync({
      billabong: require('./assets/fonts/Billabong.ttf')
    })
  }

  async fetchFeed() {
    const response = await fetch(
      'https://api.instagram.com/v1/users/self/media/recent/?access_token=' +
        process.env.INSTAGRAM_TOKEN
    )
    const posts = await response.json()
    const comments = await this.makeCommentsList(posts.data)
    const font = await Font.loadAsync({
      billabong: require('./assets/fonts/Billabong.ttf')
    })

    this.setState({
      fontLoaded: true,
      loaded: true,
      data: posts.data,
      comments: comments
    })
  }

  async makeCommentsList(posts) {
    let postsArray = posts.map(async post => {
      const postId = post.id

      if (post.comments.length === 0) {
        return (
          <View style={styles.comment} key={postId}>
            <Text>No Comments!</Text>
          </View>
        )
      } else {
        const response = await fetch(
          'https://api.instagram.com/v1/media/' +
            postId +
            '/comments?access_token=' +
            this.access_token
        )
        const comments = await response.json()
        const commentsArray = comments.data
        console.log('comments.data', comments.data)

        const commentsList = commentsArray.map(commentInfo => {
          return (
            <View style={styles.comment} key={commentInfo.id}>
              <Text style={styles.commentText}>
                {commentInfo.from.username}
              </Text>
              <Text>{commentInfo.text}</Text>
            </View>
          )
        })
        return commentsList
      }
    })
    postsArray = await Promise.all(postsArray)
    return postsArray
  }

  createPost(postInfo, index) {
    const imageUri = postInfo.images.standard_resolution.url
    const username = postInfo.user.username
    const numLikes = postInfo.likes.count

    return (
      <View>
        <Text style={styles.infoText}>{username}</Text>

        <Image style={styles.image} source={{ uri: imageUri }} />
        <View style={styles.info}>
          <Text style={styles.infoText}>
            {numLikes + (numLikes !== 1 ? ' likes' : ' like')}
          </Text>
        </View>
        <View>{this.state.comments[index]}</View>
      </View>
    )
  }

  render() {
    if (!this.state.loaded) {
      return <AppLoading />
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SimpleLineIcons
            name="camera"
            size={32}
            color="#125688"
            style={styles.leftIcon}
          />
          {this.state.fontLoaded ? (
            <Text style={styles.title}>Reactstagram</Text>
          ) : null}
          <Ionicons
            name="md-paper-plane"
            size={32}
            color="#125688"
            style={styles.rightIcon}
          />
        </View>
        <FlatList
          data={this.state.data}
          renderItem={({ item, index }) => this.createPost(item, index)}
          keyExtractor={item => item.id}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingTop: Constants.statusBarHeight,
    marginBottom: 0
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderColor: '#d8d8d8'
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5
  },
  likeText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  comment: {
    flex: 1,
    flexWrap: 'wrap',
    padding: 10,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderColor: '#d8d8d8'
  },
  commentText: {
    paddingRight: 15,
    fontWeight: 'bold'
  },
  title: {
    fontFamily: 'billabong',
    fontSize: 32,
    letterSpacing: -0.5,
    color: '#125688',
    textShadowColor: '#cfdde7',
    textShadowOffset: { width: 0, height: 2 }
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderColor: '#d8d8d8',
    height: 50
  },
  leftIcon: {
    marginLeft: 10,
    textShadowColor: '#cfdde7',
    textShadowOffset: { width: 0, height: 2 }
  },
  rightIcon: {
    marginRight: 10,
    textShadowColor: '#cfdde7',
    textShadowOffset: { width: 0, height: 2 }
  }
})

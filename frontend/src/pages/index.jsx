import React, { Component } from 'react';
import Eos from 'eosjs';
import ecc from 'eosjs-ecc';

// material-ui dependencies
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ScatterJS from 'scatter-js/dist/scatter.esm';
import { Menu, MenuItem } from '@material-ui/core';
import BackIcon from '@material-ui/icons/ArrowBack';

var scatter = undefined;
var account = undefined;
var eos = undefined;

const network = {
  blockchain:'eos',
  protocol:'https',
  host:'nodes.get-scatter.com',
  port:443,
  chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
}

network.chainId = "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f";
network.host = "localhost";
network.protocol ="http";
network.port = 8888;

network.chainId = "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191";
network.host = "api-kylin.eosasia.one";
network.protocol ="https";
network.port = 443;


const connect = async () => {
  const requiredFields = { accounts:[network] };
  await scatter.getIdentity(requiredFields).then(() => {
      account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
      const eosOptions = { expireInSeconds:60 };
      eos = scatter.eos(network, Eos, eosOptions);
      console.log("account: " + account.name);
      return true;
  }).catch(e => {
    console.log("scatter " + e);
    return false;
  });
}

const disconnect = async () => {
  account = undefined;
  console.log("disconnect");
  if (scatter) {
    scatter.forgetIdentity();
  }
}

const sendTransaction = async (account, actionName, actionData) => {                
      if (!account) {
        console.log("no account");
        return Promise.reject(Error("No account"));      
      }

      const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };
      const result = await eos.transaction({
        actions: [{
          account: "eosioprofile",
          name: actionName,
          authorization: [{
            actor: account.name,
            permission: account.authority
          }],
          data: actionData,
        }],
      }, transactionOptions);
      
      return result;
}


// set up styling classes using material-ui "withStyles"
const styles = theme => ({
  card: {
    margin: 20,
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  formButton: {
    marginTop: theme.spacing.unit,
    width: "100%",
  },
  grow: {
    flexGrow:1
  },
});

// Index component
class Index extends Component {

  constructor(props) {
    super(props)
    this.state = {
      profileTable: [], // to store the table rows from smart contract
      account: undefined,
      anchorEl: null,
      showEdit: false,
      profileUrl: null
    };
    this.handleTitanFormEvent = this.handleTitanFormEvent.bind(this);
    this.handleGithubFormEvent = this.handleGithubFormEvent.bind(this);
    this.handlePlainFormEvent = this.handlePlainFormEvent.bind(this);
    this.getEosAccount = this.getEosAccount.bind(this);
    this.forgetEosAccount = this.forgetEosAccount.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
  }

  getEosAccount = async () => {
    if (account) {
      console.log("account found:" + account.name);      
      this.setState({account});
      this.getProfile();
      return account;
    } else {
      return connect().then(async () => {
        
        console.log("try again after connect in getEosAccount");
        return await this.getEosAccount()
      }
    );
    }
  }

  forgetEosAccount =() => {
    this.setState({account:undefined});
    disconnect();
  }

  getProfile = (accountName) => {
    eos.getTableRows({
      "json": true,
      "code": "eosioprofile",   // contract who owns the table
      "scope": "eosioprofile",  // scope of the table
      "table": "profiles",    // name of the table as specified by the contract abi
      "limit": 1,
      "lower": accountName,
      "upper": accountName + "0"
  }).then(result => {
    if (result.rows.length > 0) {
      console.log("profiles found:" + JSON.stringify(result.rows));
      let uri = result.rows[0].uri;  
      let uriHash = result.rows[0].hash;
      console.log("load from " + uri);        
      fetch(uri).then(async result => {
        const profilePlain = await result.text();
        const hash = ecc.sha256(profilePlain)
        if (hash == uriHash) {
          const profile = JSON.parse(profilePlain)
          const profileUrl = profile.profile.profile_picture_url        
          console.log("profileUrl " + profileUrl);
          this.setState({profileUrl});                
        } else {
          console.log("profile has changed");
        }
      }
      ).catch(error => {
        console.log("could not load profile "  + error)
      })
    }
  }).catch(error => console.error(error))
  }


  async handleTitanFormEvent(event) {
    // stop default behaviour
    event.preventDefault();
    const account = await this.getEosAccount();
    this.publishProfileUri(account.name, "https://labs.eostitan.com/api/v1/account-profiles/all/" + account.name);   
  }

  async handleGithubFormEvent(event) {
    // stop default behaviour
    event.preventDefault();
    const account = await this.getEosAccount();
    // collect form data
    let githubAccount = event.target.githubAccount.value;
    //let gist = event.target.gist.value;
    //verifyGist(getEosAccountName(), gist);
    this.publishProfileUri(account.name, "https://github.com/" + githubAccount)     
  }
  
  // generic function to handle form events (e.g. "submit" / "reset")
  // push transactions to the blockchain by using eosjs
  async handlePlainFormEvent(event) {
    // stop default behaviour
    event.preventDefault();

    // collect form data
    let uri = event.target.uri.value;
    const account = await this.getEosAccount();
    this.publishProfileUri(account.name, uri)         
  }

  publishProfileUri(accountName, uri) {
    const {account} = this.state;
    const actionName = "update";
    const actionData = {         
          user: accountName, 
          uri: uri,
        };
    this.getHash(uri).then(async hash => {
      console.log("hash: " + hash)
      actionData.hash = hash
      sendTransaction(account, actionName, actionData)
      .then(result => {
        this.setState({showEdit:false});
        this.getTable()})
      .catch(error => console.error("publishProfileUri error:" + error))      
    }).catch(error => {
      console.error("failed to hash " + error)
    });
  }

  deleteProfile(event) {
      event.preventDefault();
      const {account} = this.state;
      if (account) {
        const actionName="erase";
        const actionData = {user:account.name}
        sendTransaction(account, actionName, actionData)
        .then(result => {
          this.setState({showEdit:false});
          this.getTable()})
        .catch(error => console.error("publishProfileUri error:" + error));
      }
  }

  async getHash(uri) {
    return new Promise(async (resolve, reject) => {
      console.log("fetching " + uri)
      fetch(uri, {
        method: 'GET'
      }).then(async rawResponse => {
        const response = await rawResponse.text();
        resolve(ecc.sha256(response));    
      }).catch(error => {
        reject(error);
      })
      
    });
  }

  // gets table data from the blockchain
  // and saves it into the component state: "profileTable"
  getTable() {
    const eos = Eos();
    eos.getTableRows({
      "json": true,
      "code": "eosioprofile",   // contract who owns the table
      "scope": "eosioprofile",  // scope of the table
      "table": "profiles",    // name of the table as specified by the contract abi
      "limit": 100,
    }).then(result => this.setState({ profileTable: result.rows }));
  }

  componentDidMount() {
    this.getTable();


    ScatterJS.scatter.connect("EOSIO Profile").then(connected => {
      console.log("connected " + connected.toString());
      if(!connected) return false;
      scatter = ScatterJS.scatter;
      window.scatter = null;
    });


  }
  
  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  render() {
    const { profileTable, account, anchorEl, showEdit, profileUrl } = this.state;
    const open = Boolean(anchorEl);
    const { classes } = this.props;

    // generate each note as a card
    const generateCard = (key, timestamp, user, uri, hash) => (
      <Card className={classes.card} key={key}>
        <CardContent>
          <Typography variant="headline" component="h2">
            {user}
          </Typography>
          <Typography style={{fontSize:12}} color="textSecondary" gutterBottom>
            {new Date(timestamp*1000).toString()}
          </Typography>
          <Typography>
            {uri}
          </Typography>
          <Typography >
            {hash}
          </Typography>
        </CardContent>
      </Card>
    );
    let profileCards = profileTable.map((row, i) =>
      generateCard(i, row.timestamp, row.user, row.uri, row.hash));
     
    let renderMenu = () => 
      (
        <div>
          <IconButton
            aria-owns={open ? 'menu-appbar' : null}
            aria-haspopup="true"
            onClick={this.handleMenu}
            color="inherit"
          >
          {!profileUrl && 
          (<AccountCircle />)}
          {profileUrl &&       
          (<div style={{backgroundImage:`url(`+profileUrl + `)`, width:"20px", height:"20px", backgroundSize:"100%", borderRadius:"50%" }}/>)}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={this.handleClose}
          >
            <MenuItem onClick={() => {
              this.setState({anchorEl:null, showEdit:true})}}>Edit {account.name}</MenuItem>              
            <MenuItem onClick={() => {
               this.setState({anchorEl:null})
              this.forgetEosAccount()}}>Logout</MenuItem>
          </Menu>
        </div>
      );

    return (
      <div>
        <AppBar position="static" color="default" className={classes.grow}>
          <Toolbar>
            {showEdit && (
          <IconButton className={{marginLeft: "-12", marginRight: "20"}} 
          color="inherit" aria-label="Menu"
          onClick={()=>{this.setState({showEdit:false})}}>
            <BackIcon />
          </IconButton>
            )}
            <Typography variant="title" color="inherit" className={classes.grow}>
            {!showEdit && (<span>EOSIO Profiles</span>)}
            {showEdit && (<span>EOSIO Profile {account.name}</span>)}
            </Typography>
            {account && renderMenu()}
            {!account && (<Button color="inherit"
                onClick={async () => await this.getEosAccount()}>Login</Button>)}                                          
          </Toolbar>
        </AppBar>
        {!showEdit && profileCards}
        {showEdit &&(<div>
        <Paper className={classes.paper}>
          <form onSubmit={this.handleTitanFormEvent}>                        
            <Button
              variant="contained"
              color="primary"
              className={classes.formButton}
              type="submit">
              Use Titan Public Profile
            </Button>
          </form>
        </Paper>
        <Paper className={classes.paper}>
          <form onSubmit={this.handleGithubFormEvent}>                        
          <TextField
              name="githubAccount"
              autoComplete="off"
              label="Github name"
              margin="normal"              
              fullWidth
            />            
            <Button
              variant="contained"
              color="primary"
              className={classes.formButton}
              type="submit">
              Use Github Public Profile
            </Button>
          </form>
        </Paper>
        <Paper className={classes.paper}>
          <form onSubmit={this.handlePlainFormEvent}>                                  
            <TextField
              name="uri"
              autoComplete="off"
              label="Profile Uri"
              margin="normal"              
              fullWidth
            />            
            <Button
              variant="contained"
              color="primary"
              className={classes.formButton}
              type="submit">
              Add / Update profile
            </Button>
          </form>
        </Paper>  
        <Paper className={classes.paper}>
          <form onSubmit={this.deleteProfile}>                                              
            <Button
              variant="contained"
              className={classes.formButton}
              type="submit">
              Delete Profile
            </Button>
          </form>
        </Paper>  
        </div>)}      
      </div>
    );
  }

}

export default withStyles(styles)(Index);

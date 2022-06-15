import React from 'react';
import logo from './logo.svg';
import Button from '@mui/material/Button';
import Container from '@mui/material/Button';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Menu } from '@mui/material';
import { MenuItem } from '@mui/material';
import {GuRender} from './Render';

//import { makeStyles } from "@mui/material/styles";

// const useStyles = makeStyles((theme: any) => ({
//   paper: {
//     padding: theme.spacing(1),
//     textAlign: "center",
//     color: theme.palette.text.secondary
//   }
// }));

// const theme = {
//   palette: {
//     type: 'light',
//     primary: {
//       main: '#212729',
//     },
//     secondary: {
//       main: '#abcfe2',
//     },
//   }
// };

function GridItem() {
  return (
    // From 0 to 600px wide (smart-phones), I take up 12 columns, or the whole device width!
    // From 600-690px wide (tablets), I take up 6 out of 12 columns, so 2 columns fit the screen.
    // From 960px wide and above, I take up 25% of the device (3/12), so 4 columns fit the screen.
    <Grid item xs={12} sm={6} md={3}>
      <Paper >item</Paper>
    </Grid>
  );
}

// export default function AutoGrid() {
//   const classes = useStyles();
//   return (
//     <div>
//       <h3> Ex 4: Responsive Material UI Grid </h3>
//       // I am a container Grid with 1 (8px) spacing
//       <Grid container spacing={1}>
//         <GridItem classes={classes} />
//         <GridItem classes={classes} />
//         <GridItem classes={classes} />
//         <GridItem classes={classes} />
//       </Grid>
//     </div>
//   );
// }

let theme = createTheme({
  palette: {
    primary: {
      main: '#212729',
      dark: '#abcfe2',
      light: '#abcfe2',
    },
  },
});
class PositionedMenu extends React.Component<any, any>  {
  constructor(props: any) {
    super(props);
    this.state = {
      anchorEl: null
    };
  }
  render() {
    const handleClick = (event: any) => {
      this.setState({ anchorEl: event.currentTarget });
      //setAnchorEl(event.currentTarget);
    };
    const closeMenu = () =>{
      this.setState({ anchorEl: null });
    }
    const exitApp = () => {
      closeMenu();
      GuRender.exitApp();
    };
    const open = Boolean(this.state.anchorEl);

    return (
      <div>
        <Button
          id="demo-positioned-button"
          aria-controls={open ? 'demo-positioned-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          Dashboard
        </Button>
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={this.state.anchorEl}
          open={open}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={exitApp}>Exit</MenuItem>
        </Menu>
      </div>
    );
  }
}


const booger = (x: any) => { console.log("HI"); };
const open = (x: any) => { };
function App() {
  // <img src={logo} className="App-logo" alt="logo" />

  //Basically the useState is a c# property, but React also wires up events to it
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <PositionedMenu></PositionedMenu>
      </ThemeProvider>
      <Container>

        <ThemeProvider theme={theme}>

          {/* <Menu open={menuOpen}>
          <MenuItem onClick={booger}>FUCK</MenuItem>
          <MenuItem onClick={() => { setMenuOpen(true) }}>aaaSSSS</MenuItem>
        </Menu> */}
          <Modal
            open={modalOpen}
            onClose={() => { setModalOpen(false) }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Paper sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
            }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Text in a modal
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </Typography>
            </Paper>
          </Modal>

          {/* <Grid container spacing={1}>
            <GridItem />
            <GridItem />
            <GridItem />
            <GridItem />
          </Grid> */}
        </ThemeProvider>
      </Container>
    </div>
  );
}

export default App;

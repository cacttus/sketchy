import React from 'react';
import logo from './logo.svg';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import Typography from "@mui/material/Typography";
import {
  Menu, Divider, Stack, MenuItem, Grid, Paper, Modal, Button, Box, Collapse,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader
} from '@mui/material';
import { RenderThread } from './Render';
// import {ExpandLess, ExpandMore, StarBorder } from '@mui/icons-material';
// import SendIcon from '@mui/icons-material/Send';
// import DraftsIcon from '@mui/icons-material/Drafts';
// import InboxIcon from '@mui/icons-material/Inbox';

function NestedList() {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List
      sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Nested List Items
        </ListSubheader>
      } >
      <ListItemButton>
        <ListItemIcon>
          <span className="material-icons md-dark">outbox</span>
        </ListItemIcon>
        <ListItemText primary="Sent mail" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <span className="material-icons md-dark">drafts</span>
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItemButton>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <span className="material-icons md-dark">inbox</span>

        </ListItemIcon>
        <ListItemText primary="Inbox" />
        {open ? <span className="material-icons md-dark">expand_less</span> : <span className="material-icons md-dark">expand_more</span>}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <span className="material-icons md-dark">star_border</span>
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
}

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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

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
    const closeMenu = () => {
      this.setState({ anchorEl: null });
    }
    const exitApp = () => {
      closeMenu();
      RenderThread.exitApp();
    };
    const open = Boolean(this.state.anchorEl);

    return (
      <Box sx={{ width: '100%' }}>
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

      </Box>
    );
  }
}
function App() {
  // <img src={logo} className="App-logo" alt="logo" />

  //Basically the useState is a c# property, but React also wires up events to it
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      <ThemeProvider theme={theme}>
        <Stack
          direction="column"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
        >
          <Item>
            <PositionedMenu></PositionedMenu>
          </Item>

          <Item>
            <input
              type="file"
              id="dirinput"
              /* @ts-expect-error */
              directory=""
              webkitdirectory=""
              multiple
              onChange={() => { }}
            />
            <label>hi</label>
          </Item>
          <Item>
            <NestedList></NestedList>
          </Item>
        </Stack>

        {/*Modal should be outside*/}
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
      </ThemeProvider>
    </Box>
  );
}

export default App;

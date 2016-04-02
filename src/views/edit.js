/* globals UI */

var C = UI.Views.Connector;

class EditForm extends C.View {
  constructor(props) {
    super(props);
    this.state = {
      events: []
    };
    if (!props.connector) {
      this.state.mode = 'connect';
    }
  }
  connect() {
    this.props.onConnect();
  }
  render() {
    return (
      <C.Page default="setup" {...this.props}>
        <C.Panel name="Setup" slug="setup">
          <UI.FormElements.Button text={this.props.connectorInstance ? 'Reauthorize' : 'Connect'} type="large" onClick={()=>{
              return this.connect();
            }} />
        </C.Panel>
        {this.props.connectorInstance ? <C.Panel name="Events" slug="events">
        <C.PageHeader
          title="Check the boxes of the events you want to subscribe to."
          subTitle="Checking a box will automatically subscribe you to that event." />
          <C.CheckboxGrid
            items={this.getAvailableEvents()}
            checked={this.getSubscribedEvents()}
            onChange={this.props.onSubscribe} />
        </C.Panel> : <C.Panel name="Events" slug="events">
          <C.EventsGrid.Header
            title="Events are available once you've connected." />
        </C.Panel>}
      </C.Page>
    );
  }
}

export default EditForm;
global.EditForm = EditForm;

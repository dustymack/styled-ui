webpackJsonp([10],{1920:function(e,t,n){var a=n(1),o=n(86),s=n(433).PageRenderer;s.__esModule&&(s=s.default);var r=o({displayName:"WrappedPageRenderer",getInitialState:function(){return{content:n(1966)}},componentWillMount:function(){},render:function(){return a.createElement(s,Object.assign({},this.props,{content:this.state.content}))}});r.__catalog_loader__=!0,e.exports=r},1966:function(e,t){e.exports="## Share Dialog with default footer\n\n```react\nshowSource: true\nstate: { isOpen: false, shareUrl: 'https://examplecommunity.church/', message: 'Checkout our awesome church website' }\n---\n<ModalDemo>\n\t<Button primary medium onClick={() => setState({ isOpen: true })}>Open a modal!</Button>\n\t<ShareDialog\n\t\tisOpen={state.isOpen}\n\t\tshareUrl={state.shareUrl}\n\t\tmessage={state.message}\n\t\tonClose={() => setState({ isOpen: false })}\n\t/>\n</ModalDemo>\n```\n"}});
//# sourceMappingURL=10.ed7dd8b8.chunk.js.map
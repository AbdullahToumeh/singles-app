import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";
import Audio from "../../imports/files";
import { withTracker } from "meteor/react-meteor-data";

class UploadForm extends Component {
  componentDidMount() {
    // Use Meteor Blaze to render login button
    this.renderForm();
  }
  renderForm() {
    this.sounds = Blaze.render(
      Template.sounds,
      ReactDOM.findDOMNode(this.refs.sounds)
    );

    this.login = Blaze.render(
      Template.loginButtons,
      ReactDOM.findDOMNode(this.refs.login)
    );
  }
  cleanForm() {
    Blaze.remove(this.sounds); // Clean up Blaze view
    Blaze.remove(this.login);
  }
  componentWillUnmount() {
    this.cleanForm();
  }
  render() {
    return (
      <div>
        <span ref="login" />

        <div>
          <span ref="sounds" />
        </div>
      </div>
    ); // Render a placeholder
  }
}

export default (UploadFormContainer = withTracker(() => {
  return {
    currentUser: Meteor.user()
  };
})(UploadForm));

Template.files.onCreated(() => {
  Meteor.subscribe("files.audio.all");
});
Template.sounds.helpers({
  user() {
    return Meteor.userId();
  }
});

Template.files.helpers({
  audioFile() {
    return Audio.findOne({ userId: Meteor.userId() });
  },
  user() {
    return Meteor.userId();
  }
});

Template.uploadForm.events({
  "change #fileInput"(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      console.log("Uploading....");
      const upload = Audio.insert(
        {
          file: e.currentTarget.files[0],
          streams: "dynamic",
          chunkSize: "dynamic"
        },
        false
      );

      // upload.on('start', function () {
      //   template.currentUpload.set(this);
      // });

      upload.on("end", function(error, fileObj) {
        if (error) {
          alert("Error during upload: " + error);
        } else {
          alert('File "' + fileObj.name + '" successfully uploaded');
        }
        //   template.currentUpload.set(false);
      });

      upload.start();
    }
  }
});
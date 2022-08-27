import React from "react";
import Picker from "emoji-picker-react";

const FlagPicker = (props) => {
  const { onEmojiClick } = props;
  return (
    <Picker
      onEmojiClick={onEmojiClick}
      style={{ width: "100%" }}
      groupVisibility={{
        smileys_people: false,
        animals_nature: false,
        food_drink: false,
        travel_places: false,
        activities: false,
        objects: false,
        symbols: false,
        recently_used: false,
      }}
      disableSkinTonePicker={true}
      pickerStyle={{
        width: "100%",
        marginTop: 40,
        marginBottom: 40,
      }}
    />
  );
};

export default FlagPicker;


// Initialize Blockly Setup

// --- SCRATCH THEME DEFINITION ---
export const getScratchTheme = () => {
  const Blockly = (window as any).Blockly;
  if (!Blockly) return null;

  return Blockly.Theme.defineTheme('scratch', {
    'base': Blockly.Themes.Classic,
    'blockStyles': {
      'motion_blocks': {
        'colourPrimary': '#4C97FF',
        'colourSecondary': '#4280D7',
        'colourTertiary': '#3373CC'
      },
      'looks_blocks': {
        'colourPrimary': '#9966FF',
        'colourSecondary': '#855CD6',
        'colourTertiary': '#774DCB'
      },
      'events_blocks': {
        'colourPrimary': '#FFBF00',
        'colourSecondary': '#E6AC00',
        'colourTertiary': '#CC9900'
      },
      'control_blocks': {
        'colourPrimary': '#FFAB19',
        'colourSecondary': '#EC9C13',
        'colourTertiary': '#CF8B17'
      },
      'sensors_blocks': {
        'colourPrimary': '#00C7E5',
        'colourSecondary': '#00B8D4',
        'colourTertiary': '#00ACC1'
      },
      'logic_blocks': {
        'colourPrimary': '#59C059',
        'colourSecondary': '#46B946',
        'colourTertiary': '#389438'
      },
      'math_blocks': {
          'colourPrimary': '#59C059',
          'colourSecondary': '#46B946',
          'colourTertiary': '#389438'
        },
    },
    'categoryStyles': {
      'motion_category': { 'colour': '#4C97FF' },
      'looks_category': { 'colour': '#9966FF' },
      'events_category': { 'colour': '#FFBF00' },
      'control_category': { 'colour': '#FFAB19' },
      'sensors_category': { 'colour': '#00C7E5' },
      'logic_category': { 'colour': '#59C059' }
    },
    'componentStyles': {
      'workspaceBackgroundColour': '#F9F9F9',
      'toolboxBackgroundColour': '#FFFFFF',
      'toolboxForegroundColour': '#575E75',
      'flyoutBackgroundColour': '#F9F9F9',
      'flyoutOpacity': 1,
      'scrollbarColour': '#CECDCE',
      'insertionMarkerColour': '#000000',
      'insertionMarkerOpacity': 0.2,
      'cursorColour': '#000000',
    },
    'fontStyle': {
      'family': '"Rubik", "Helvetica Neue", Helvetica, sans-serif',
      'weight': 'bold',
      'size': 12,
    }
  });
};

export const initBlockly = () => {
  const Blockly = (window as any).Blockly;
  const javascript = (window as any).javascript;
  
  if (!Blockly || !javascript) return;
  
  const javascriptGenerator = javascript.javascriptGenerator;

  // Custom Numpad Field
  class FieldNumpad extends Blockly.FieldNumber {
    constructor(value?: any, min?: any, max?: any, precision?: any, validator?: any) {
        super(value, min, max, precision, validator);
    }
    showEditor_() {
        if (window.showBlocklyNumpad) {
            window.showBlocklyNumpad(this.getValue(), (newValue) => {
                this.setValue(newValue);
            });
        } else {
            super.showEditor_(); 
        }
    }
  }

  // Custom Color Dropper Field
  class FieldColorDropper extends Blockly.FieldColour {
    constructor(value?: any, validator?: any) {
        super(value, validator);
    }
    showEditor_() {
        if (window.showBlocklyColorPicker) {
            window.showBlocklyColorPicker((newColor: string) => {
                this.setValue(newColor);
            });
        } else {
            super.showEditor_();
        }
    }
  }

  // --- ICONS HELPERS ---
  const SHAPE_CONFIGS: Record<string, {path: string, color: string, extra?: string}> = {
    'heart': { path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', color: '#FF0000' },
    'star': { path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', color: '#0000FF' },
    'triangle': { 
        path: 'M1 21h22L12 2 1 21z', 
        color: '#008000',
        extra: '<path d="M12 18h0.01M12 14v-4" stroke="yellow" stroke-width="2.5" stroke-linecap="round"/>' 
    },
    'circle': { path: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z', color: '#FFFF00' },
    'square': { path: 'M3 3h18v18H3z', color: '#800080' },
    'pentagon': { path: 'M12 2.5l8.1 5.9-3.1 9.6h-10l-3.1-9.6z', color: '#FFA500' }
  };

  const getShapeSvg = (shape: string) => {
    const config = SHAPE_CONFIGS[shape];
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="${config.path}" fill="${config.color}" stroke="black" stroke-width="0.5"/>
        ${config.extra || ''}
      </svg>
    `)}`;
  };

  // Envelope SVG (White)
  const MESSAGE_ENVELOPE_SVG = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6" fill="none"/>
    </svg>
  `)}`;

  // Send Envelope SVG (White)
  const MESSAGE_SEND_SVG = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 4h14c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="18,6 9,11 0,6" fill="none"/>
      <path d="M19 14l4 4-4 4" fill="none" stroke="%2322c55e" stroke-width="2.5"/>
      <path d="M14 18h8" fill="none" stroke="%2322c55e" stroke-width="2.5"/>
    </svg>
  `)}`;

  const MESSAGE_SHAPES = [
    [{src: getShapeSvg('heart'), width: 28, height: 28, alt: 'Heart'}, 'heart'],
    [{src: getShapeSvg('star'), width: 28, height: 28, alt: 'Star'}, 'star'],
    [{src: getShapeSvg('triangle'), width: 28, height: 28, alt: 'Alert'}, 'triangle'],
    [{src: getShapeSvg('circle'), width: 28, height: 28, alt: 'Circle'}, 'circle'],
    [{src: getShapeSvg('square'), width: 28, height: 28, alt: 'Square'}, 'square'],
    [{src: getShapeSvg('pentagon'), width: 28, height: 28, alt: 'Pentagon'}, 'pentagon']
  ];

  // --- EVENTS ---

  Blockly.Blocks['event_program_start'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("כאשר לוחצים על")
          .appendField(new Blockly.FieldImage(
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='%234C97FF' stroke='%234C97FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z'/%3E%3Cline x1='4' y1='22' x2='4' y2='15'/%3E%3C/svg%3E",
            20, 20, "Flag"
          ));
      this.setNextStatement(true, null);
      this.setStyle('events_blocks');
    }
  };

  // BROADCAST (SEND)
  Blockly.Blocks['event_broadcast'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("שלח מסר")
          .appendField(new Blockly.FieldImage(MESSAGE_SEND_SVG, 32, 32, "*"))
          .appendField(new Blockly.FieldDropdown(MESSAGE_SHAPES), "SHAPE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('events_blocks');
    }
  };

  // RECEIVE (HAT)
  Blockly.Blocks['event_when_received'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("כאשר מתקבל מסר")
          .appendField(new Blockly.FieldImage(MESSAGE_ENVELOPE_SVG, 32, 32, "*"))
          .appendField(new Blockly.FieldDropdown(MESSAGE_SHAPES), "SHAPE");
      this.setNextStatement(true, null);
      this.setStyle('events_blocks');
    }
  };

  Blockly.Blocks['event_when_obstacle'] = {
      init: function() {
          this.appendDummyInput().appendField("כאשר מזוהה מכשול");
          this.setNextStatement(true, null);
          this.setStyle('events_blocks');
      }
  };

  // --- MOTION ---
  Blockly.Blocks['robot_move'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("סע")
          .appendField(new Blockly.FieldDropdown([["קדימה","FORWARD"], ["אחורה","BACKWARD"]]), "DIRECTION")
          .appendField("מרחק")
          .appendField(new FieldNumpad(10), "DISTANCE")
          .appendField("ס\"מ");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motion_blocks'); 
    }
  };

  Blockly.Blocks['robot_move_speed'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("סע")
          .appendField(new Blockly.FieldDropdown([["קדימה","FORWARD"], ["אחורה","BACKWARD"]]), "DIRECTION")
          .appendField("מרחק")
          .appendField(new FieldNumpad(10), "DISTANCE")
          .appendField("ס\"מ במהירות")
          .appendField(new FieldNumpad(50, 0, 100), "SPEED")
          .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motion_blocks'); 
    }
  };

  Blockly.Blocks['robot_stop'] = {
      init: function() {
          this.appendDummyInput().appendField("עצור תנועה");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setStyle('motion_blocks');
      }
  };

  Blockly.Blocks['robot_turn'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("פנה")
          .appendField(new Blockly.FieldDropdown([["ימינה","RIGHT"], ["שמאלה","LEFT"]]), "DIRECTION")
          .appendField("בזווית")
          .appendField(new FieldNumpad(90), "ANGLE")
          .appendField("מעלות");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motion_blocks');
    }
  };

  Blockly.Blocks['robot_set_speed'] = {
      init: function() {
          this.appendDummyInput()
              .appendField("קבע מהירות ל-")
              .appendField(new FieldNumpad(100, 0, 100), "SPEED")
              .appendField("%");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setStyle('motion_blocks');
      }
  };

  // --- LOOKS ---
  Blockly.Blocks['robot_led'] = {
    init: function() {
      const colourOptions = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#FFFFFF", "#FFA500"];
      this.appendDummyInput()
          .appendField("קבע צבע נורה")
          .appendField(new Blockly.FieldDropdown([["שמאלית","LEFT"], ["ימנית","RIGHT"], ["שתיהן","BOTH"]]), "SIDE")
          .appendField(new Blockly.FieldColour("#ff0000", null, { colourOptions, columns: 4 }), "COLOR");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('looks_blocks');
    }
  };

  Blockly.Blocks['robot_led_off'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("כבה נורה")
          .appendField(new Blockly.FieldDropdown([["שמאלית","LEFT"], ["ימנית","RIGHT"], ["שתיהן","BOTH"]]), "SIDE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('looks_blocks');
    }
  };
  
  Blockly.Blocks['robot_wait'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("חכה")
          .appendField(new FieldNumpad(1), "SECONDS")
          .appendField("שניות");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('control_blocks');
    }
  };

  Blockly.Blocks['math_number'] = {
      init: function() {
        this.appendDummyInput().appendField(new FieldNumpad(0), 'NUM');
        this.setOutput(true, 'Number');
        this.setStyle('math_blocks'); 
      }
  }

  // --- SENSORS ---
  Blockly.Blocks['sensor_ultrasonic'] = {
    init: function() {
      this.appendDummyInput().appendField("מרחק ממכשול (ס\"מ)");
      this.setOutput(true, "Number");
      this.setStyle('sensors_blocks');
    }
  };

  Blockly.Blocks['sensor_touch'] = {
    init: function() {
      this.appendDummyInput().appendField("חיישן מגע לחוץ?");
      this.setOutput(true, "Boolean");
      this.setStyle('sensors_blocks');
    }
  };

  Blockly.Blocks['sensor_gyro'] = {
    init: function() {
      this.appendDummyInput().appendField("זווית גירו");
      this.setOutput(true, "Number");
      this.setStyle('sensors_blocks');
    }
  };
  
  Blockly.Blocks['sensor_color'] = {
    init: function() {
      this.appendDummyInput().appendField("צבע מזוהה");
      this.setOutput(true, "String");
      this.setStyle('sensors_blocks');
    }
  };

  Blockly.Blocks['sensor_touching_color'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("נוגע בצבע")
          .appendField(new FieldColorDropper("#ffbf00"), "COLOR")
          .appendField("?");
      this.setOutput(true, "Boolean");
      this.setStyle('sensors_blocks');
    }
  };

  // --- GENERATORS ---
  javascriptGenerator.forBlock['event_program_start'] = () => '// התחלת תוכנית\n';
  
  javascriptGenerator.forBlock['event_broadcast'] = (block: any) => {
    const shape = block.getFieldValue('SHAPE');
    return `await robot.broadcast('${shape}');\n`;
  };

  javascriptGenerator.forBlock['event_when_received'] = (block: any) => {
    const shape = block.getFieldValue('SHAPE');
    return `// --- כאשר מתקבל מסר ${shape} ---\n`;
  };

  javascriptGenerator.forBlock['robot_move'] = (block: any) => {
    const direction = block.getFieldValue('DIRECTION');
    const distance = block.getFieldValue('DISTANCE');
    const distVal = direction === 'BACKWARD' ? -distance : distance;
    return `await robot.move(${distVal});\n`;
  };

  javascriptGenerator.forBlock['robot_move_speed'] = (block: any) => {
    const direction = block.getFieldValue('DIRECTION');
    const distance = block.getFieldValue('DISTANCE');
    const speed = block.getFieldValue('SPEED');
    const distVal = direction === 'BACKWARD' ? -distance : distance;
    return `await robot.setSpeed(${speed});\nawait robot.move(${distVal});\n`;
  };
  
  javascriptGenerator.forBlock['robot_stop'] = () => 'await robot.stop();\n';

  javascriptGenerator.forBlock['robot_turn'] = (block: any) => {
    const direction = block.getFieldValue('DIRECTION');
    const angle = block.getFieldValue('ANGLE');
    const angVal = direction === 'LEFT' ? angle : -angle;
    return `await robot.turn(${angVal});\n`;
  };

  javascriptGenerator.forBlock['robot_set_speed'] = (block: any) => {
      const speed = block.getFieldValue('SPEED');
      return `await robot.setSpeed(${speed});\n`;
  };

  javascriptGenerator.forBlock['robot_led'] = (block: any) => {
    const side = block.getFieldValue('SIDE');
    const color = block.getFieldValue('COLOR');
    return `robot.setLed('${side.toLowerCase()}', '${color}');\n`;
  };

  javascriptGenerator.forBlock['robot_led_off'] = (block: any) => {
      const side = block.getFieldValue('SIDE');
      return `robot.setLed('${side.toLowerCase()}', 'black');\n`;
  };
  
  javascriptGenerator.forBlock['robot_wait'] = (block: any) => {
    const seconds = block.getFieldValue('SECONDS');
    return `await robot.wait(${seconds * 1000});\n`;
  };

  javascriptGenerator.forBlock['math_number'] = (block: any) => {
      const code = parseFloat(block.getFieldValue('NUM'));
      const order = code >= 0 ? javascriptGenerator.ORDER_ATOMIC : javascriptGenerator.ORDER_UNARY_NEGATION;
      return [code, order];
  }

  javascriptGenerator.forBlock['sensor_ultrasonic'] = () => ['await robot.getDistance()', javascriptGenerator.ORDER_ATOMIC];
  javascriptGenerator.forBlock['sensor_touch'] = () => ['await robot.getTouch()', javascriptGenerator.ORDER_ATOMIC];
  javascriptGenerator.forBlock['sensor_gyro'] = () => ['await robot.getGyro()', javascriptGenerator.ORDER_ATOMIC];
  javascriptGenerator.forBlock['sensor_color'] = () => ['await robot.getColor()', javascriptGenerator.ORDER_ATOMIC];
  javascriptGenerator.forBlock['sensor_touching_color'] = (block: any) => {
    const color = block.getFieldValue('COLOR');
    return [`await robot.isTouchingColor('${color}')`, javascriptGenerator.ORDER_ATOMIC];
  };
};

export const toolbox = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "אירועים",
      categorystyle: "events_category",
      cssConfig: { "container": "category-events" },
      contents: [
          { kind: "block", type: "event_program_start" },
          { kind: "block", type: "event_broadcast" },
          { kind: "block", type: "event_when_received" },
          { kind: "block", type: "event_when_obstacle" }
      ]
    },
    {
      kind: "category",
      name: "תנועה",
      categorystyle: "motion_category",
      cssConfig: { "container": "category-motion" },
      contents: [
        { kind: "block", type: "robot_move" },
        { kind: "block", type: "robot_move_speed" }, 
        { kind: "block", type: "robot_stop" },
        { kind: "block", type: "robot_turn" },
        { kind: "block", type: "robot_set_speed" },
      ]
    },
    {
      kind: "category",
      name: "נראות",
      categorystyle: "looks_category",
      cssConfig: { "container": "category-looks" },
      contents: [
        { kind: "block", type: "robot_led" },
        { kind: "block", type: "robot_led_off" },
      ]
    },
    {
      kind: "category",
      name: "חיישנים",
      categorystyle: "sensors_category",
      cssConfig: { "container": "category-sensors" },
      contents: [
        { kind: "block", type: "sensor_ultrasonic" },
        { kind: "block", type: "sensor_touch" },
        { kind: "block", type: "sensor_gyro" },
        { kind: "block", type: "sensor_color" },
        { kind: "block", type: "sensor_touching_color" },
      ]
    },
    {
      kind: "category",
      name: "בקרה",
      categorystyle: "control_category",
      cssConfig: { "container": "category-control" },
      contents: [
        { kind: "block", type: "robot_wait" },
        { kind: "block", type: "controls_repeat_ext", inputs: { TIMES: { shadow: { type: "math_number", fields: { NUM: 5 } } } } },
        { kind: "block", type: "controls_if" },
      ]
    },
    {
        kind: "category",
        name: "לוגיקה",
        categorystyle: "logic_category",
        cssConfig: { "container": "category-logic" },
        contents: [
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_boolean" },
            { kind: "block", type: "math_arithmetic" },
            { kind: "block", type: "math_number" },
        ]
    }
  ]
};

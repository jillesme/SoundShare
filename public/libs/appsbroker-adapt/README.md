# Adapt: dynamic forms

## Table of Contents

1. [View JSON](#view)
	1. [Component JSON schemas](#components)
		1. [&lt;input&gt;](#inputs)
			1. [input:text](#input-text)
  			1. [input:date](#input-date)
  			1. [input:checkbox](#input-checkbox)
  			1. [input:radio](#input-radio)
  		1. [&lt;select&gt;](#selects)
			1. [select](#select)
			1. [select:multiple](#select-multiple)
		1. [&lt;textarea&gt;](#textarea)
		1. [&lt;button&gt;](#button)
	1. [Element JSON schemas](#elements)
		1. [column](#column)
			1. [column](#column-default)
			1. [column:rows](#column-rows)	
		1. [label](#label)
		1. [description](#description)
		1. [accordion](#accordion)
		1. [header](#header)
		1. [tabcordion](#tabcordion)
			1. [hr](#hr)
		1. [table](#table)
		1. [tabs](#tabs)
1. [Model JSON](#view)
	1. [Model types](#model-types)
	1. [Component model types](#model-component)
1. [Controller JSON](#controller)
	1. [JSON Schema](#controller-schema)
		1. [Object JSON](#controller-object)
		1. [Item JSON](#controller-item)

<a id="view"></a>
# View JSON

<a id="components"></a>
## Component JSON schemas

These tables describe the JSON schemas for each individual component, providing example values, types, descriptions, whether properties are optional and their default values.

<a id="inputs"></a>
### &lt;input&gt;

Descriptions for all `<input>` types available in Adapt.

<a id="input-text"></a>
#### input:text

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "input:text" | String | Type of rendered input |  |
| label | "Username" | String | Text for label | Yes | "" |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| placeholder | "Enter a username" | String | Text for placeholder | Yes | "" |
| description | "Username will be your login" | String | Description/help text | Yes | "" |

<a id="input-date"></a>
#### input:date

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | input:date | String | Type of rendered input |  |
| label | "Shipping date" | String | Text for label | Yes | "" |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| placeholder | "Enter your DOB" | String | Text for placeholder | Yes | "" |
| description | "Select a date for shipping orders" | String | Description/help text | Yes | "" |

<a id="input-checkbox"></a>
#### input:checkbox

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | input:checkbox | String | Type of rendered input |  |
| label | "Shipping date" | String | Text for label | Yes | "" |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| description | "Select a date for shipping orders" | String | Description/help text | Yes | "" |
| options | { optionOne: "Option One" } | Object | Object with key/value pairs for each checkbox | Yes | "" |

<a id="input-radio"></a>
#### input:radio

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | input:date | String | Type of rendered input |  |
| label | "Shipping date" | String | Text for label | Yes | "" |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| description | "Select a date for shipping orders" | String | Description/help text | Yes | "" |
| options | { optionOne: "Option One" } | Object | Object with key/value pairs for each radio item | Yes | "" |

<a id="selects"></a>
### &lt;select&gt;

Descriptions for all `<select>` types available in Adapt.

<a id="select"></a>
#### select

Renders a single select dropdown component

##### Component JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | select | String | Type of rendered input |  |
| options | [{}] | Array of objects |  | Yes | "" |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| label | * | String | Text for label | Yes | '' |
| placeholder | * | String | Text for placeholder | Yes | '' |
| description | * | String | Description/help text | Yes | '' |

##### Options JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| value | 1 | String | Value of select item | No |
| label | One | String | Label to display select item | No |  |

<a id="select-multiple"></a>
#### select:multiple

Renders a multiple select component.

##### Component JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | select:multiple | String | Type of rendered input |  |
| label | * | String | Text for label | Yes | '' |
| options | [{}] | Array of objects |  | Yes | "" |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| placeholder | * | String | Text for placeholder | Yes | '' |
| description | * | String | Description/help text | Yes | '' |


##### Options JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| value | 1 | String | Value of select item | No |
| label | One | String | Label to display select item | No |  |

<a id="textarea"></a>
### &lt;textarea&gt;

Renders a textarea

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | textarea | String | Type of rendered input |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| label | * | String | Text for label | Yes | '' |
| placeholder | * | String | Text for placeholder | Yes | '' |
| description | * | String | Description/help text | Yes | ''  |

<a id="button"></a>
### &lt;button&gt;

Renders a textarea

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | button | String | Type of rendered input |  |
| text | Submit! | String | Text for button |  | '' |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| label | Submit the form | String | Text for label | Yes | '' |
| description | Press this button to submit | String | Description/help text | Yes | ''  |

<a id="elements"></a>
## Element JSON schemas

These tables describe the JSON schemas for each individual component, providing example values, types, descriptions, whether properties are optional and their default values.

<a id="column"></a>
### Column

Descriptions for all `column` types available in Adapt.

<a id="column-default"></a>
#### column

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "column" | String | Type of rendered element |  |
| items | [{}, {}] | Array | Array of objects for each column |  | "" |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| span | [3, 1] | String or Array | Width for each column | | |

The span property can be either an array or string. If all columns are the same width, you can use a string, but if you have columns with varying widths, use an array. If the array does not have values for each column, it will be repeated - i.e. for 4 columns, `[2, 3]` would be the equivilent of `[2, 3, 2, 3]`

<a id="column-rows"></a>
#### column:rows

Instead of having fixed columns, these are purely rows at whatever width specified, allowing you to have dynamically added fields display correctly on the page.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "column:rows" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| items | {} | Object | Object of items |  | "" |
| span | [3, 1] | String or Array | Width for each column |  | |

<a id="label"></a>
### Label

The label item. This is mainly used by fields, but you can use it if you wish.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "label" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| label | "Hello" | String | The label's text | | |

<a id="description"></a>
### Description

The description item. This is mainly used by fields, but you can use it if you wish.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "label" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| desc | "Hello" | String | The label's text | | |

<a id="accordion"></a>
### Accordion

The accordion item.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "accordion" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| model | {} | Object | The model view for each accordion created | | |
| title | "Accordion" | String | The title for each accordion | | |
| accordionTitle | "Item {index}" | String | The title for each accordion | | |

With the `accordionTitle` property, you can use `{variableName}` to display a value within that accordion. If you wish to display the accordion number, use `{index}`.

<a id="header"></a>
### Header

The header item. This is mainly used by components, but you can use it if you wish.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "header:h1" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| text | "Hello" | String | The titles text | | |

You can use `header:h1` all the way through to `header:h6`.

<a id="tabcordion"></a>
### Tabcordion

The tabcordion item.

#### Component JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "tabcordion" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| items | {} | Object | The object of items to display | | |

#### Items JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| tabType | "tab" | String | Type of tab, either tab or accordion |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| title | "Processes" | String | The title of the tab | | |
| items | {} | Object | The object of items to in the tab | | |
| addText | "Add Item" | String | The wording for the button to add a new accordion item | | |
| accordionTitle | "Item {index}" | String | The title for each accordion | | |
| accordionSubtitle | "" | String | The subtitle for each accordion | | |

With the `accordionTitle` and `accordionSubtitle` properties, you can use `{variableName}` to display a value within that accordion. If you wish to display the accordion number, use `{index}`.

<a id="hr"></a>
### HR

The hr item, used to split sections of the form up.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "hr" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |

<a id="table"></a>
### Table

The table item.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "table" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| model | {} | Object | The model view for each table row created | | |

The table will create an index column for each item. For each column header, it will go through the model provided and use the `label` property. Labels and descriptions on component within the model object will not be displayed above/below the component.

<a id="tabs"></a>
### Tabs

The tabs item.

#### Component JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "table" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show component | Yes | All States |
| items | {} | Object | Items object containing each tab | | |

#### Items JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| type | "table" | String | Type of rendered element |  |
| state | ["State1"] | String\|Array | State for when to show tab | Yes | All States |
| title | "Tab One" | String | The title of the tab | | |
| items | {} | Object | Items for the tab content | | |

The table will create an index column for each item. For each column header, it will go through the model provided and use the `label` property. Labels and descriptions on component within the model object will not be displayed above/below the component.

<a id="model"></a>
# Model JSON

The base model is created from the view, and then any default values passed into adapt will be added in. For most components, the model will be key value pairs, however for complex items, different formats are used.

<a id="model-types"></a>
## Model types

| Type | Value | Description | Example | Example Description |
|------|---------------|------|---|--|
| ArrayObject | [{}] | An array of objects containing values for each item. Normally used for components that have a dynamic items in it, such as a table or accordion. Each object will be populated from the components `model` property | componentName: [{"inputOne": "Hello"}] | This will have one item, setting the `inputOne` component's value to `"Hello"` |
| Array | [] | An array containing string values of what has been selected. Normally used when the component can have multiple items selected, such as a `select`. | componentName: ["hello"] | This will have the appropriate item with the value `"hello"` selected |
| Flat | "" | Most common model type. Used mainly for inputs that require text, such as an `input`. | componentName: "Hello" | This will set the component with the name `componentName`'s value to `"Hello"` |

<a id="model-component""></a>
## Component model types

| Component | Default Model Value |
|------|---------------|------|
| accordion | ArrayObject |
| button | Flat |
| column |  |
| columnRows |  |
| description |  |
| header |  |
| hr |  |
| input | Flat |
| input:date | Flat |
| input:checkbox | Array |
| input:radio | Array |
| label |  |
| select | Flat |
| select:multiple | Array |
| tabcordion |  |
| table | ArrayObject |
| tabs |  |
| textarea | Flat |

For the components that do not have default model values, they will be invisible in the model.

<a id="controller"></a>
# Controller JSON

The controller JSON is an array of objects. Each object will describe the controller for different states (either multiple can be covered by one object, or just a singular state).

<a id="controller-schema"></a>
## JSON Schema

<a id="controller-object"></a>
### Object JSON

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| state | ["State1"] | String\|Array | State for when this applies | Yes | All States |
| items | {} | Object | Controller object information | | |

<a id="controller-item"></a>
### Item JSON
The key for this object will refer to the component you wish to control.

| Prop | Example Value | Type | Description | Optional | Default |
|------|---------------|------|-------------|----------|---------|
| pattern | "email" | String | Validation rule for component, either regex or a preset | Yes | "" |
| required | True | Boolean | Whether or not the input is required in order to continue | Yes | false |
| disabled | True | Boolean | Whether or not the input is disabled | Yes | false |
| minlength | 1 | Integer | The minimum accepted length of text in the model value | Yes | "" |
| maxlength | 10 | Integer | The maximum accepted length of the text in the model value | Yes | "" |
| min | 1 | Integer | The minimum number in the model value | Yes | "" |
| max | 10 | Integer | The maximum number in the model value | Yes | "" |
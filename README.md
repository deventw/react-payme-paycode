# React PayMe PayCode

A React component for PayMe PayCode online payment.

## Features

- Out of the box.
- Easy to use.

## Installation

To install the component, use npm or yarn:

```bash
npm install react-payme-paycode
```

or

```bash
yarn add react-payme-paycode
```

## Usage

```tsx
import React from 'react';
import { PayCode } from 'react-payme-paycode';

function App() {
  return (
    <div>
      <h1>Pay with PayCode</h1>
      <PayCode 
        value="https://payment.example.com/123456"
        typeNumber={0}
        errorCorrectionLevel="M"
        size={344}
        consumer={false}
      />
    </div>
  );
}

export default App;
```

## Props

The PayCode component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Text/URL to be encoded in the QR code. |
| `typeNumber` | `number` | 4 | QR code type number (0-40). Use 0 for Auto Detect, higher numbers allow more data. |
| `errorCorrectionLevel` | `string` | "M" | Error correction level of the PayCode. |
| `size` | `number` | 300 | The size of the PayCode in pixels (recommended minimum: 250px for optimal scanning). |
| `consumer` | `boolean` | false | UI style variant for whether the PayCode is for a consumer or not. |

## Acknowledgement

This project is a learning exercise to explore payment gateway integration in React applications. It is not affiliated with PayMe and is intended for educational purposes only. The PayCode component simulates payment processes without handling real transactions.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

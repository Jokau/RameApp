const DATA_LENTGH = 13
const SIZE_BYTE = 0
const TYPE_BYTE = 1
const SIGN_BYTE = 2
const VALUE_INT_START = 3
const VALUE_INT_END = 5
const VALUE_DEC_START = 6
const VALUE_DEC_END = 8
const SEQ_NB_START = 10
const SEQ_NB_END = 11

const codeToDataType = {
  49: 'info', // 0x31
  50: 'data', // 0x32
  43: '+',    // 0x2B
  45: '-',    // 0x2D
}

export { DATA_LENTGH, SIZE_BYTE, TYPE_BYTE, SIGN_BYTE, VALUE_INT_START, VALUE_INT_END, VALUE_DEC_START, VALUE_DEC_END, SEQ_NB_START, SEQ_NB_END, codeToDataType }

/**
 * Unified source of truth modeled after zxing-cpp ZX_BCF_LIST.
 */
declare const BCF: readonly [readonly ["All", "*", "*", "     ", 0, "All"], readonly ["AllReadable", "*", "r", "     ", 0, "All Readable"], readonly ["AllCreatable", "*", "w", "     ", 0, "All Creatable"], readonly ["AllLinear", "*", "l", "     ", 0, "All Linear"], readonly ["AllMatrix", "*", "m", "     ", 0, "All Matrix"], readonly ["AllGS1", "*", "G", "     ", 0, "All GS1"], readonly ["AllRetail", "*", "R", "     ", 0, "All Retail"], readonly ["AllIndustrial", "*", "I", "     ", 0, "All Industrial"], readonly ["Codabar", "F", " ", "lrw  ", 18, "Codabar"], readonly ["Code39", "A", " ", "lrw I", 8, "Code 39"], readonly ["Code39Std", "A", "s", "lrw I", 8, "Code 39 Standard"], readonly ["Code39Ext", "A", "e", "lr  I", 9, "Code 39 Extended"], readonly ["Code32", "A", "2", "lr  I", 129, "Code 32"], readonly ["PZN", "A", "p", "lr  I", 52, "Pharmazentralnummer"], readonly ["Code93", "G", " ", "lrw I", 25, "Code 93"], readonly ["Code128", "C", " ", "lrwGI", 20, "Code 128"], readonly ["ITF", "I", " ", "lrw I", 3, "ITF"], readonly ["ITF14", "I", "4", "lr  I", 89, "ITF-14"], readonly ["DataBar", "e", " ", "lr GR", 29, "DataBar"], readonly ["DataBarOmni", "e", "o", "lr GR", 29, "DataBar Omni"], readonly ["DataBarStk", "e", "s", "lr GR", 79, "DataBar Stacked"], readonly ["DataBarStkOmni", "e", "O", "lr GR", 80, "DataBar Stacked Omni"], readonly ["DataBarLtd", "e", "l", "lr GR", 30, "DataBar Limited"], readonly ["DataBarExp", "e", "e", "lr GR", 31, "DataBar Expanded"], readonly ["DataBarExpStk", "e", "E", "lr GR", 81, "DataBar Expanded Stacked"], readonly ["EANUPC", "E", " ", "lr  R", 15, "EAN/UPC"], readonly ["EAN13", "E", "1", "lrw R", 15, "EAN-13"], readonly ["EAN8", "E", "8", "lrw R", 10, "EAN-8"], readonly ["EAN5", "E", "5", "l   R", 12, "EAN-5"], readonly ["EAN2", "E", "2", "l   R", 11, "EAN-2"], readonly ["ISBN", "E", "i", "lr  R", 69, "ISBN"], readonly ["UPCA", "E", "a", "lrw R", 34, "UPC-A"], readonly ["UPCE", "E", "e", "lrw R", 37, "UPC-E"], readonly ["Telepen", "B", " ", "lr  I", 32, "Telepen"], readonly ["TelepenAlpha", "B", "0", "lr  I", 32, "Telepen Alpha"], readonly ["TelepenNumeric", "B", "1", "lr  I", 87, "Telepen Numeric"], readonly ["OtherBarcode", "X", " ", " r   ", 0, "Other barcode"], readonly ["DXFilmEdge", "X", "x", "lr   ", 147, "DX Film Edge"], readonly ["PDF417", "L", " ", "mrw  ", 55, "PDF417"], readonly ["CompactPDF417", "L", "c", "mr   ", 56, "Compact PDF417"], readonly ["MicroPDF417", "L", "m", "mr   ", 84, "MicroPDF417"], readonly ["Aztec", "z", " ", "mr G ", 92, "Aztec"], readonly ["AztecCode", "z", "c", "mrwG ", 92, "Aztec Code"], readonly ["AztecRune", "z", "r", "mr   ", 128, "Aztec Rune"], readonly ["QRCode", "Q", " ", "mrwG ", 58, "QR Code"], readonly ["QRCodeModel1", "Q", "1", "mr   ", 0, "QR Code Model 1"], readonly ["QRCodeModel2", "Q", "2", "mr   ", 58, "QR Code Model 2"], readonly ["MicroQRCode", "Q", "m", "mr   ", 97, "Micro QR Code"], readonly ["RMQRCode", "Q", "r", "mr G ", 145, "rMQR Code"], readonly ["DataMatrix", "d", " ", "mrwG ", 71, "Data Matrix"], readonly ["MaxiCode", "U", " ", "mr   ", 57, "MaxiCode"]];
declare const ALIASES: {
    /**
     * @deprecated Use `DataBarExp` instead.
     */
    readonly DataBarExpanded: "DataBarExp";
    /**
     * @deprecated Use `DataBarLtd` instead.
     */
    readonly DataBarLimited: "DataBarLtd";
    /**
     * @deprecated Use `AllLinear` instead.
     */
    readonly "Linear-Codes": "AllLinear";
    /**
     * @deprecated Use `AllMatrix` instead.
     */
    readonly "Matrix-Codes": "AllMatrix";
    /**
     * @deprecated Use `All` instead.
     */
    readonly Any: "All";
    readonly rMQRCode: "RMQRCode";
};
type WithAliases<T extends string> = T | {
    [K in keyof typeof ALIASES]: (typeof ALIASES)[K] extends T ? K : never;
}[keyof typeof ALIASES];
/**
 * Array of all human-readable interface (HRI) labels for barcode formats and meta-formats.
 * These are display-friendly names like "Code 39", "EAN-13", "QR Code", "All Readable", etc.
 */
export declare const BARCODE_HRI_LABELS: ("All" | "All Readable" | "All Creatable" | "All Linear" | "All Matrix" | "All GS1" | "All Retail" | "All Industrial" | "Codabar" | "Code 39" | "Code 39 Standard" | "Code 39 Extended" | "Code 32" | "Pharmazentralnummer" | "Code 93" | "Code 128" | "ITF" | "ITF-14" | "DataBar" | "DataBar Omni" | "DataBar Stacked" | "DataBar Stacked Omni" | "DataBar Limited" | "DataBar Expanded" | "DataBar Expanded Stacked" | "EAN/UPC" | "EAN-13" | "EAN-8" | "EAN-5" | "EAN-2" | "ISBN" | "UPC-A" | "UPC-E" | "Telepen" | "Telepen Alpha" | "Telepen Numeric" | "Other barcode" | "DX Film Edge" | "PDF417" | "Compact PDF417" | "MicroPDF417" | "Aztec" | "Aztec Code" | "Aztec Rune" | "QR Code" | "QR Code Model 1" | "QR Code Model 2" | "Micro QR Code" | "rMQR Code" | "Data Matrix" | "MaxiCode")[];
/**
 * Human-readable interface (HRI) label for a barcode format or meta-format.
 * For example: "Code 39", "EAN-13", "QR Code", "All Readable", "Pharmazentralnummer".
 */
export type BarcodeHriLabel = (typeof BARCODE_HRI_LABELS)[number];
declare const BARCODE_META_FORMAT_ENTRIES: (readonly ["All", "*", "*", "     ", 0, "All"] | readonly ["AllReadable", "*", "r", "     ", 0, "All Readable"] | readonly ["AllCreatable", "*", "w", "     ", 0, "All Creatable"] | readonly ["AllLinear", "*", "l", "     ", 0, "All Linear"] | readonly ["AllMatrix", "*", "m", "     ", 0, "All Matrix"] | readonly ["AllGS1", "*", "G", "     ", 0, "All GS1"] | readonly ["AllRetail", "*", "R", "     ", 0, "All Retail"] | readonly ["AllIndustrial", "*", "I", "     ", 0, "All Industrial"])[];
/**
 * Array of meta-formats that represent groups of barcode formats.
 * Includes: "All", "AllReadable", "AllCreatable", "AllLinear", "AllMatrix", "AllGS1", "AllRetail", "AllIndustrial".
 * These are not actual barcode formats but logical groupings for reader configuration.
 */
export declare const BARCODE_META_FORMATS: ("All" | "AllReadable" | "AllCreatable" | "AllLinear" | "AllMatrix" | "AllGS1" | "AllRetail" | "AllIndustrial")[];
/**
 * Meta-format representing a logical group of barcode formats.
 * Examples: "All", "AllLinear", "AllMatrix", "AllGS1".
 */
export type BarcodeMetaFormat = (typeof BARCODE_META_FORMATS)[number];
/**
 * Array of all actual barcode format names (excludes meta-formats).
 * Includes formats like "QRCode", "Code128", "EAN13", "Aztec", etc.
 */
export declare const BARCODE_FORMATS: ("Codabar" | "Code39" | "Code39Std" | "Code39Ext" | "Code32" | "PZN" | "Code93" | "Code128" | "ITF" | "ITF14" | "DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "EANUPC" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "ISBN" | "UPCA" | "UPCE" | "Telepen" | "TelepenAlpha" | "TelepenNumeric" | "OtherBarcode" | "DXFilmEdge" | "PDF417" | "CompactPDF417" | "MicroPDF417" | "Aztec" | "AztecCode" | "AztecRune" | "QRCode" | "QRCodeModel1" | "QRCodeModel2" | "MicroQRCode" | "RMQRCode" | "DataMatrix" | "MaxiCode")[];
/**
 * An actual barcode format name.
 * Examples: "QRCode", "Code128", "EAN13", "DataMatrix", "PDF417".
 * Does not include meta-formats like "All" or "AllLinear".
 */
export type BarcodeFormat = (typeof BARCODE_FORMATS)[number];
/** @deprecated Use {@link BARCODE_FORMATS} instead. */
export declare const barcodeFormats: ("Codabar" | "Code39" | "Code39Std" | "Code39Ext" | "Code32" | "PZN" | "Code93" | "Code128" | "ITF" | "ITF14" | "DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "EANUPC" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "ISBN" | "UPCA" | "UPCE" | "Telepen" | "TelepenAlpha" | "TelepenNumeric" | "OtherBarcode" | "DXFilmEdge" | "PDF417" | "CompactPDF417" | "MicroPDF417" | "Aztec" | "AztecCode" | "AztecRune" | "QRCode" | "QRCodeModel1" | "QRCodeModel2" | "MicroQRCode" | "RMQRCode" | "DataMatrix" | "MaxiCode")[];
/**
 * Array of barcode symbologies - the base formats from which variants derive.
 * Examples: "EANUPC" (parent of EAN13, EAN8, UPCA, etc.), "QRCode" (parent of MicroQRCode, RMQRCode, etc.).
 */
export declare const BARCODE_SYMBOLOGIES: ("Codabar" | "Code39" | "Code93" | "Code128" | "ITF" | "DataBar" | "EANUPC" | "Telepen" | "OtherBarcode" | "PDF417" | "Aztec" | "QRCode" | "DataMatrix" | "MaxiCode")[];
/**
 * A barcode symbology - the root format from which related variants derive.
 * For example, "EANUPC" is the symbology for EAN13, EAN8, UPCA, UPCE, ISBN, etc.
 * "QRCode" is the symbology for QRCodeModel1, QRCodeModel2, MicroQRCode, RMQRCode.
 */
export type BarcodeSymbology = (typeof BARCODE_SYMBOLOGIES)[number];
/**
 * Array of linear (1D) barcode formats.
 * Linear barcodes encode data in one dimension (horizontal bars of varying widths).
 * Examples: Code128, EAN13, Code39, ITF, DataBar, etc.
 */
export declare const LINEAR_BARCODE_FORMATS: ("Codabar" | "Code39" | "Code39Std" | "Code39Ext" | "Code32" | "PZN" | "Code93" | "Code128" | "ITF" | "ITF14" | "DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "EANUPC" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "ISBN" | "UPCA" | "UPCE" | "Telepen" | "TelepenAlpha" | "TelepenNumeric" | "DXFilmEdge")[];
/**
 * A linear (1D) barcode format.
 * Linear barcodes encode data in one dimension using horizontal bars.
 * Examples: "Code128", "EAN13", "Code39", "ITF", "DataBar".
 */
export type LinearBarcodeFormat = (typeof LINEAR_BARCODE_FORMATS)[number];
/** @deprecated Use {@link LINEAR_BARCODE_FORMATS} instead. */
export declare const linearBarcodeFormats: ("Codabar" | "Code39" | "Code39Std" | "Code39Ext" | "Code32" | "PZN" | "Code93" | "Code128" | "ITF" | "ITF14" | "DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "EANUPC" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "ISBN" | "UPCA" | "UPCE" | "Telepen" | "TelepenAlpha" | "TelepenNumeric" | "DXFilmEdge")[];
/**
 * Array of matrix (2D) barcode formats.
 * Matrix barcodes encode data in two dimensions using patterns of squares, dots, or other shapes.
 * Examples: QRCode, DataMatrix, PDF417, Aztec, MaxiCode, etc.
 */
export declare const MATRIX_BARCODE_FORMATS: ("PDF417" | "CompactPDF417" | "MicroPDF417" | "Aztec" | "AztecCode" | "AztecRune" | "QRCode" | "QRCodeModel1" | "QRCodeModel2" | "MicroQRCode" | "RMQRCode" | "DataMatrix" | "MaxiCode")[];
/**
 * A matrix (2D) barcode format.
 * Matrix barcodes encode data in two dimensions.
 * Examples: "QRCode", "DataMatrix", "PDF417", "Aztec", "MaxiCode".
 */
export type MatrixBarcodeFormat = (typeof MATRIX_BARCODE_FORMATS)[number];
/** @deprecated Use {@link MATRIX_BARCODE_FORMATS} instead. */
export declare const matrixBarcodeFormats: ("PDF417" | "CompactPDF417" | "MicroPDF417" | "Aztec" | "AztecCode" | "AztecRune" | "QRCode" | "QRCodeModel1" | "QRCodeModel2" | "MicroQRCode" | "RMQRCode" | "DataMatrix" | "MaxiCode")[];
declare const READABLE_BARCODE_FORMAT_ENTRIES: ((readonly ["Codabar", "F", " ", "lrw  ", 18, "Codabar"] & {
    3: `${string}r${string}`;
}) | (readonly ["Code39", "A", " ", "lrw I", 8, "Code 39"] & {
    3: `${string}r${string}`;
}) | (readonly ["Code39Std", "A", "s", "lrw I", 8, "Code 39 Standard"] & {
    3: `${string}r${string}`;
}) | (readonly ["Code39Ext", "A", "e", "lr  I", 9, "Code 39 Extended"] & {
    3: `${string}r${string}`;
}) | (readonly ["Code32", "A", "2", "lr  I", 129, "Code 32"] & {
    3: `${string}r${string}`;
}) | (readonly ["PZN", "A", "p", "lr  I", 52, "Pharmazentralnummer"] & {
    3: `${string}r${string}`;
}) | (readonly ["Code93", "G", " ", "lrw I", 25, "Code 93"] & {
    3: `${string}r${string}`;
}) | (readonly ["Code128", "C", " ", "lrwGI", 20, "Code 128"] & {
    3: `${string}r${string}`;
}) | (readonly ["ITF", "I", " ", "lrw I", 3, "ITF"] & {
    3: `${string}r${string}`;
}) | (readonly ["ITF14", "I", "4", "lr  I", 89, "ITF-14"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataBar", "e", " ", "lr GR", 29, "DataBar"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataBarOmni", "e", "o", "lr GR", 29, "DataBar Omni"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataBarStk", "e", "s", "lr GR", 79, "DataBar Stacked"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataBarStkOmni", "e", "O", "lr GR", 80, "DataBar Stacked Omni"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataBarLtd", "e", "l", "lr GR", 30, "DataBar Limited"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataBarExp", "e", "e", "lr GR", 31, "DataBar Expanded"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataBarExpStk", "e", "E", "lr GR", 81, "DataBar Expanded Stacked"] & {
    3: `${string}r${string}`;
}) | (readonly ["EANUPC", "E", " ", "lr  R", 15, "EAN/UPC"] & {
    3: `${string}r${string}`;
}) | (readonly ["EAN13", "E", "1", "lrw R", 15, "EAN-13"] & {
    3: `${string}r${string}`;
}) | (readonly ["EAN8", "E", "8", "lrw R", 10, "EAN-8"] & {
    3: `${string}r${string}`;
}) | (readonly ["ISBN", "E", "i", "lr  R", 69, "ISBN"] & {
    3: `${string}r${string}`;
}) | (readonly ["UPCA", "E", "a", "lrw R", 34, "UPC-A"] & {
    3: `${string}r${string}`;
}) | (readonly ["UPCE", "E", "e", "lrw R", 37, "UPC-E"] & {
    3: `${string}r${string}`;
}) | (readonly ["Telepen", "B", " ", "lr  I", 32, "Telepen"] & {
    3: `${string}r${string}`;
}) | (readonly ["TelepenAlpha", "B", "0", "lr  I", 32, "Telepen Alpha"] & {
    3: `${string}r${string}`;
}) | (readonly ["TelepenNumeric", "B", "1", "lr  I", 87, "Telepen Numeric"] & {
    3: `${string}r${string}`;
}) | (readonly ["OtherBarcode", "X", " ", " r   ", 0, "Other barcode"] & {
    3: `${string}r${string}`;
}) | (readonly ["DXFilmEdge", "X", "x", "lr   ", 147, "DX Film Edge"] & {
    3: `${string}r${string}`;
}) | (readonly ["PDF417", "L", " ", "mrw  ", 55, "PDF417"] & {
    3: `${string}r${string}`;
}) | (readonly ["CompactPDF417", "L", "c", "mr   ", 56, "Compact PDF417"] & {
    3: `${string}r${string}`;
}) | (readonly ["MicroPDF417", "L", "m", "mr   ", 84, "MicroPDF417"] & {
    3: `${string}r${string}`;
}) | (readonly ["Aztec", "z", " ", "mr G ", 92, "Aztec"] & {
    3: `${string}r${string}`;
}) | (readonly ["AztecCode", "z", "c", "mrwG ", 92, "Aztec Code"] & {
    3: `${string}r${string}`;
}) | (readonly ["AztecRune", "z", "r", "mr   ", 128, "Aztec Rune"] & {
    3: `${string}r${string}`;
}) | (readonly ["QRCode", "Q", " ", "mrwG ", 58, "QR Code"] & {
    3: `${string}r${string}`;
}) | (readonly ["QRCodeModel1", "Q", "1", "mr   ", 0, "QR Code Model 1"] & {
    3: `${string}r${string}`;
}) | (readonly ["QRCodeModel2", "Q", "2", "mr   ", 58, "QR Code Model 2"] & {
    3: `${string}r${string}`;
}) | (readonly ["MicroQRCode", "Q", "m", "mr   ", 97, "Micro QR Code"] & {
    3: `${string}r${string}`;
}) | (readonly ["RMQRCode", "Q", "r", "mr G ", 145, "rMQR Code"] & {
    3: `${string}r${string}`;
}) | (readonly ["DataMatrix", "d", " ", "mrwG ", 71, "Data Matrix"] & {
    3: `${string}r${string}`;
}) | (readonly ["MaxiCode", "U", " ", "mr   ", 57, "MaxiCode"] & {
    3: `${string}r${string}`;
}))[];
/**
 * Array of barcode formats that can be read by the reader.
 * Most barcode formats can be read; this excludes write-only formats.
 */
export declare const READABLE_BARCODE_FORMATS: ("Codabar" | "Code39" | "Code39Std" | "Code39Ext" | "Code32" | "PZN" | "Code93" | "Code128" | "ITF" | "ITF14" | "DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "EANUPC" | "EAN13" | "EAN8" | "ISBN" | "UPCA" | "UPCE" | "Telepen" | "TelepenAlpha" | "TelepenNumeric" | "OtherBarcode" | "DXFilmEdge" | "PDF417" | "CompactPDF417" | "MicroPDF417" | "Aztec" | "AztecCode" | "AztecRune" | "QRCode" | "QRCodeModel1" | "QRCodeModel2" | "MicroQRCode" | "RMQRCode" | "DataMatrix" | "MaxiCode")[];
/**
 * A barcode format that can be read by the reader.
 * Examples: "QRCode", "Code128", "EAN13", "DataMatrix", "PDF417".
 */
export type ReadableBarcodeFormat = (typeof READABLE_BARCODE_FORMATS)[number];
declare const CREATABLE_BARCODE_FORMAT_ENTRIES: ((readonly ["Codabar", "F", " ", "lrw  ", 18, "Codabar"] & {
    3: `${string}w${string}`;
}) | (readonly ["Codabar", "F", " ", "lrw  ", 18, "Codabar"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Code39", "A", " ", "lrw I", 8, "Code 39"] & {
    3: `${string}w${string}`;
}) | (readonly ["Code39", "A", " ", "lrw I", 8, "Code 39"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Code39Std", "A", "s", "lrw I", 8, "Code 39 Standard"] & {
    3: `${string}w${string}`;
}) | (readonly ["Code39Std", "A", "s", "lrw I", 8, "Code 39 Standard"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Code39Ext", "A", "e", "lr  I", 9, "Code 39 Extended"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Code32", "A", "2", "lr  I", 129, "Code 32"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["PZN", "A", "p", "lr  I", 52, "Pharmazentralnummer"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Code93", "G", " ", "lrw I", 25, "Code 93"] & {
    3: `${string}w${string}`;
}) | (readonly ["Code93", "G", " ", "lrw I", 25, "Code 93"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Code128", "C", " ", "lrwGI", 20, "Code 128"] & {
    3: `${string}w${string}`;
}) | (readonly ["Code128", "C", " ", "lrwGI", 20, "Code 128"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["ITF", "I", " ", "lrw I", 3, "ITF"] & {
    3: `${string}w${string}`;
}) | (readonly ["ITF", "I", " ", "lrw I", 3, "ITF"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["ITF14", "I", "4", "lr  I", 89, "ITF-14"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataBar", "e", " ", "lr GR", 29, "DataBar"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataBarOmni", "e", "o", "lr GR", 29, "DataBar Omni"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataBarStk", "e", "s", "lr GR", 79, "DataBar Stacked"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataBarStkOmni", "e", "O", "lr GR", 80, "DataBar Stacked Omni"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataBarLtd", "e", "l", "lr GR", 30, "DataBar Limited"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataBarExp", "e", "e", "lr GR", 31, "DataBar Expanded"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataBarExpStk", "e", "E", "lr GR", 81, "DataBar Expanded Stacked"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["EANUPC", "E", " ", "lr  R", 15, "EAN/UPC"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["EAN13", "E", "1", "lrw R", 15, "EAN-13"] & {
    3: `${string}w${string}`;
}) | (readonly ["EAN13", "E", "1", "lrw R", 15, "EAN-13"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["EAN8", "E", "8", "lrw R", 10, "EAN-8"] & {
    3: `${string}w${string}`;
}) | (readonly ["EAN8", "E", "8", "lrw R", 10, "EAN-8"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["EAN5", "E", "5", "l   R", 12, "EAN-5"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["EAN2", "E", "2", "l   R", 11, "EAN-2"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["ISBN", "E", "i", "lr  R", 69, "ISBN"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["UPCA", "E", "a", "lrw R", 34, "UPC-A"] & {
    3: `${string}w${string}`;
}) | (readonly ["UPCA", "E", "a", "lrw R", 34, "UPC-A"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["UPCE", "E", "e", "lrw R", 37, "UPC-E"] & {
    3: `${string}w${string}`;
}) | (readonly ["UPCE", "E", "e", "lrw R", 37, "UPC-E"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Telepen", "B", " ", "lr  I", 32, "Telepen"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["TelepenAlpha", "B", "0", "lr  I", 32, "Telepen Alpha"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["TelepenNumeric", "B", "1", "lr  I", 87, "Telepen Numeric"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DXFilmEdge", "X", "x", "lr   ", 147, "DX Film Edge"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["PDF417", "L", " ", "mrw  ", 55, "PDF417"] & {
    3: `${string}w${string}`;
}) | (readonly ["PDF417", "L", " ", "mrw  ", 55, "PDF417"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["CompactPDF417", "L", "c", "mr   ", 56, "Compact PDF417"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["MicroPDF417", "L", "m", "mr   ", 84, "MicroPDF417"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["Aztec", "z", " ", "mr G ", 92, "Aztec"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["AztecCode", "z", "c", "mrwG ", 92, "Aztec Code"] & {
    3: `${string}w${string}`;
}) | (readonly ["AztecCode", "z", "c", "mrwG ", 92, "Aztec Code"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["AztecRune", "z", "r", "mr   ", 128, "Aztec Rune"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["QRCode", "Q", " ", "mrwG ", 58, "QR Code"] & {
    3: `${string}w${string}`;
}) | (readonly ["QRCode", "Q", " ", "mrwG ", 58, "QR Code"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["QRCodeModel2", "Q", "2", "mr   ", 58, "QR Code Model 2"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["MicroQRCode", "Q", "m", "mr   ", 97, "Micro QR Code"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["RMQRCode", "Q", "r", "mr G ", 145, "rMQR Code"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["DataMatrix", "d", " ", "mrwG ", 71, "Data Matrix"] & {
    3: `${string}w${string}`;
}) | (readonly ["DataMatrix", "d", " ", "mrwG ", 71, "Data Matrix"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}) | (readonly ["MaxiCode", "U", " ", "mr   ", 57, "MaxiCode"] & {
    4: Exclude<(typeof BCF)[number][4], 0>;
}))[];
/**
 * Array of barcode formats that can be created by the writer.
 * Formats are creatable if they have the 'w' flag or a non-zero Zint ID.
 */
export declare const CREATABLE_BARCODE_FORMATS: ("Codabar" | "Code39" | "Code39Std" | "Code39Ext" | "Code32" | "PZN" | "Code93" | "Code128" | "ITF" | "ITF14" | "DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "EANUPC" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "ISBN" | "UPCA" | "UPCE" | "Telepen" | "TelepenAlpha" | "TelepenNumeric" | "DXFilmEdge" | "PDF417" | "CompactPDF417" | "MicroPDF417" | "Aztec" | "AztecCode" | "AztecRune" | "QRCode" | "QRCodeModel2" | "MicroQRCode" | "RMQRCode" | "DataMatrix" | "MaxiCode")[];
/**
 * A barcode format that can be created by the writer.
 * Examples: "QRCode", "Code128", "EAN13", "DataMatrix", "PDF417".
 */
export type CreatableBarcodeFormat = (typeof CREATABLE_BARCODE_FORMATS)[number];
/**
 * Array of barcode formats that support GS1 data encoding.
 * GS1 is a global standard for supply chain barcodes.
 */
export declare const GS1_BARCODE_FORMATS: ("Code128" | "DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "Aztec" | "AztecCode" | "QRCode" | "RMQRCode" | "DataMatrix")[];
/**
 * A barcode format that supports GS1 data encoding.
 * GS1 is used in retail and supply chain applications.
 * Examples: "Code128", "DataBar", "QRCode", "DataMatrix", "Aztec".
 */
export type GS1BarcodeFormat = (typeof GS1_BARCODE_FORMATS)[number];
/**
 * Array of barcode formats commonly used in retail applications.
 * These include product labeling formats like EAN, UPC, and related variants.
 */
export declare const RETAIL_BARCODE_FORMATS: ("DataBar" | "DataBarOmni" | "DataBarStk" | "DataBarStkOmni" | "DataBarLtd" | "DataBarExp" | "DataBarExpStk" | "EANUPC" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "ISBN" | "UPCA" | "UPCE")[];
/**
 * A barcode format commonly used in retail applications.
 * Retail formats are typically found on consumer products.
 * Examples: "EAN13", "EAN8", "UPCA", "UPCE", "ISBN", "DataBar".
 */
export type RetailBarcodeFormat = (typeof RETAIL_BARCODE_FORMATS)[number];
/**
 * Array of barcode formats commonly used in industrial and logistics applications.
 * These include formats used for inventory, shipping, tracking, and pharmaceutical labeling.
 */
export declare const INDUSTRIAL_BARCODE_FORMATS: ("Code39" | "Code39Std" | "Code39Ext" | "Code32" | "PZN" | "Code93" | "Code128" | "ITF" | "ITF14" | "Telepen" | "TelepenAlpha" | "TelepenNumeric")[];
/**
 * A barcode format commonly used in industrial and logistics applications.
 * Industrial formats are used for inventory, shipping, tracking, and pharmaceutical labeling.
 * Examples: "Code39", "Code128", "ITF", "PZN", "Code93".
 */
export type IndustrialBarcodeFormat = (typeof INDUSTRIAL_BARCODE_FORMATS)[number];
/**
 * Expands a symbology into its corresponding formats.
 * For example, "EANUPC" expands to ["EAN13", "EAN8", "EAN5", "EAN2", "ISBN", "UPCA", "UPCE"].
 */
export declare function symbologyToFormats(symbology: BarcodeSymbology): BarcodeFormat[];
/**
 * Finds the symbology of a given format.
 * For example, "EAN13" belongs to the "EANUPC" symbology.
 * Returns `undefined` if the format does not belong to any symbology.
 */
export declare function formatToSymbology(format: BarcodeFormat): BarcodeSymbology | undefined;
/**
 * Returns the human-readable label of a barcode format name, deprecated alias, or HRI label.
 * For example, "Code32" returns "Code 32", "PZN" returns "Pharmazentralnummer".
 * Returns `undefined` if the input is not found.
 */
export declare function formatToLabel(format: string): BarcodeHriLabel | undefined;
/**
 * Barcode formats that can be used in {@link ReaderOptions.formats | `ReaderOptions.formats`} to read barcodes.
 */
export type ReadInputBarcodeFormat = WithAliases<(typeof READABLE_BARCODE_FORMAT_ENTRIES)[number][0 | 5] | (typeof BARCODE_META_FORMAT_ENTRIES)[number][0 | 5]>;
/**
 * Barcode formats that can be used in {@link WriterOptions.format | `WriterOptions.format`} to write barcodes.
 */
export type WriteInputBarcodeFormat = WithAliases<(typeof CREATABLE_BARCODE_FORMAT_ENTRIES)[number][0 | 5]>;
/**
 * Barcode formats that may be returned in {@link ReadResult.format | `ReadResult.format`} in read functions.
 */
export type ReadOutputBarcodeFormat = ReadableBarcodeFormat | "None";
/**
 * Union of all possible barcode format values accepted or returned by the library.
 * Includes input formats (with aliases and HRI labels), output formats, and meta-formats.
 */
export type LooseBarcodeFormat = ReadInputBarcodeFormat | WriteInputBarcodeFormat | ReadOutputBarcodeFormat;
/**
 * Encodes a barcode format into the string representation accepted by the C++ parser.
 *
 * This normalizes deprecated aliases (e.g. `"Linear-Codes"` -> `"AllLinear"`).
 * Human-readable labels and canonical names are passed through.
 */
export declare function encodeFormat(format: LooseBarcodeFormat): string;
/**
 * Encodes an array of barcode formats into the C++ parser friendly format list.
 */
export declare function encodeFormats(formats: LooseBarcodeFormat[]): string;
export {};

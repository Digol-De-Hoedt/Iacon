export const calculateQty = (subPoSummaryData: object) => {
    let totalQty = {};
    let cuttingWastage = subPoSummaryData['CUTTING_WASTAGE'] ?? [];
    let originalQty = subPoSummaryData['ORIGINAL_QUANTITY'] ?? [];
    let extraShipmentQty = subPoSummaryData['EXTRA_SHIPMENT'] ?? [];
    let sampleQty = subPoSummaryData['SAMPLE'] ?? [];

    cuttingWastage.map((item) => {
        if(totalQty.hasOwnProperty(item.size)) {
            totalQty[item.size] += item.quantity;
        }else {
            totalQty[item.size] = item.quantity;
        }
    })

    originalQty.map((item) => {
        if(totalQty.hasOwnProperty(item.size)) {
            totalQty[item.size] += item.quantity;
        }else {
            totalQty[item.size] = item.quantity;
        }
    })

    extraShipmentQty.map((item) => {
        if(totalQty.hasOwnProperty(item.size)) {
            totalQty[item.size] += item.quantity;
        }else {
            totalQty[item.size] = item.quantity;
        }
    })

    sampleQty.map((item) => {
        if(totalQty.hasOwnProperty(item.size)) {
            totalQty[item.size] += item.quantity;
        }else {
            totalQty[item.size] = item.quantity;
        }
    })


    return totalQty;
}

export const calculateSizeRatios = (defaultSizes: Array<any>, totalQuantities: object) => {

    // Assigning quantities Best Ratio
    const qtyBySizes = defaultSizes.map((item) => ({...item, qty: totalQuantities[item.size]}));
    const sortedQtyBySizes = qtyBySizes;
    sortedQtyBySizes.sort((a,b) => a.qty - b.qty);

    // Using least value as the ratio piles

    const leastQty = sortedQtyBySizes[0].qty;
    const sizeRatios = qtyBySizes.map((item) => {
        let ratio = item.qty / leastQty;
        return {
            size: item.size,
            ratio: Math.ceil(ratio)
        }
    })

    return {sizeRatios, leastQty};
}

export const calculateSizeRatiosByColor = (defaultSizes: Array<any>, colors: Array<any>,totalQuantities: Array<any>) => {

    const leastQtyByColor = totalQuantities.map((item) => {
        return Object.keys(item).map((key) => item[key]).sort((a,b) => a -b)[0];
    })

    const leastQty = Math.min(...leastQtyByColor);


    const sizeRatios =  totalQuantities.map((quantities) => {
        return defaultSizes.map((item) => {
            return {size: item.size, ratio: Math.ceil(quantities[item.size] / leastQty)}
        });
    })

    // Getting optimum ratios for sizes
    const optimumRatios = defaultSizes.map((item) => {
        const allRatios = [].concat(...sizeRatios);
        const currentSizeMax = allRatios.filter((ratioItem) => ratioItem.size === item.size).map((singleSizeRatio) => singleSizeRatio.ratio);
        return {...item, ratio: Math.max(...currentSizeMax)}
    })


    return {sizeRatios: optimumRatios, leastQty}
}

export const groupComponentGroupsByCgName = (componentGroups) => {
    let groupedObject = {};

    componentGroups.map((item) => {
        if(groupedObject.hasOwnProperty(item.cgName)) {
            groupedObject[item.cgName].push(item.cgId);
        }else {
            groupedObject[item.cgName] = [item.cgId];
        }
    })

    return Object.keys(groupedObject).map((item) => groupedObject[item]);
}

export const groupMaxPliesDetails = (maxPlies) => {
    let groupedObject = {};

    maxPlies.map((item) => {
        if(groupedObject.hasOwnProperty(item.masterPoDetailsId)) {
            groupedObject[item.masterPoDetailsId].push(item);
        }else {
            groupedObject[item.masterPoDetailsId] = [item];
        }
    })

    return Object.keys(groupedObject).map((item) => groupedObject[item]);
}

export const calculateMultiColorQty = (subPoSummaryData, colors) => {

    let cuttingWastage = subPoSummaryData['CUTTING_WASTAGE'] ?? [];
    let originalQty = subPoSummaryData['ORIGINAL_QUANTITY'] ?? [];
    let extraShipmentQty = subPoSummaryData['EXTRA_SHIPMENT'] ?? [];
    let sampleQty = subPoSummaryData['SAMPLE'] ?? [];

    let groupedCuttingWastage = colors.map((item) => cuttingWastage.filter((qtyObj) => qtyObj.color === item.color));
    let groupedOriginalQty = colors.map((item) => originalQty.filter((qtyObj) => qtyObj.color === item.color));
    let groupedExtraShippingQty = colors.map((item) => extraShipmentQty.filter((qtyObj) => qtyObj.color === item.color));
    let groupedSampleQty = colors.map((item) => sampleQty.filter((qtyObj) => qtyObj.color === item.color));


    const qtyByColors =  colors.map((item, itemIndex) => {
    return [...groupedCuttingWastage[itemIndex], ...groupedOriginalQty[itemIndex], ...groupedExtraShippingQty[itemIndex], ...groupedSampleQty[itemIndex]]
    });

    return qtyByColors.map((item) => {
        let totalQty = {};
       item.map((colorQtyItem) => {
            if(totalQty.hasOwnProperty(colorQtyItem.size)) {
                totalQty[colorQtyItem.size] += colorQtyItem.quantity;
            }else {
                totalQty[colorQtyItem.size] = colorQtyItem.quantity;
            }
        })

        return totalQty;

    })



}
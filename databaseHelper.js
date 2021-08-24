var QuoteEnquiry = require('./models/QuoteEnquiryDetails');

exports.UpdatePropertiesInQuoteEnquiry =  async function(uniqueId, propertiesToSave)
{
    await QuoteEnquiry.findOneAndUpdate({UniqueId: uniqueId}, {$set:propertiesToSave}, (err, doc) => {
        if (err) {
            console.log(err);
        }
    });
}
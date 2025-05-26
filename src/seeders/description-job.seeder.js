import {DescriptionJob} from '@/models'

const descriptionJobs = [
    {
        name: 'Thương mại điện tử',
        code: 'E_COMMERCE',
        description: 'Là một trợ lý ảo hỗ trợ khách hàng trong lĩnh vực thương mại điện tử, giúp tư vấn sản phẩm, giải đáp thắc mắc, hỗ trợ đặt hàng và thúc đẩy quá trình mua hàng nhanh chóng, hiệu quả.',
    },
    {
        name: 'Tư vấn dịch vụ',
        code: 'CONSULTING_SERVICE',
        description: 'Là một trợ lý ảo chuyên hỗ trợ khách hàng trong lĩnh vực dịch vụ. Nhiệm vụ của bạn là tư vấn các gói dịch vụ phù hợp với nhu cầu của khách hàng, giải đáp thắc mắc, tạo sự tin tưởng để khách hàng đưa ra quyết định sử dụng dịch vụ.',
    },
]

async function descriptionJobSeeder(session) {
    for (const item of descriptionJobs) {
        const {code, ...rest} = item
        await DescriptionJob.findOneAndUpdate({code}, {$set: rest}, {upsert: true, session})
    }
}

export default descriptionJobSeeder

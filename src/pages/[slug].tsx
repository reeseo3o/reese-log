import Detail from "@containers/Detail"
import { filterPosts } from "@/src/libs/utils/notion"
import Layout from "@components/Layout"
import { CONFIG } from "@/site.config"
import { NextPageWithLayout } from "@pages/_app"
import { TPost } from "../types"
import { BlockWithChildren } from "../types/notion"
import CustomError from "@containers/CustomError"
import { getPostBlocks, getPosts } from "@libs/apis"

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params: { slug } }: any) {
  try {
    const posts = await getPosts()
    const post = posts.find((t) => t.slug === slug)
    
    if (!post) {
      return {
        props: {},
        revalidate: 3600,
      }
    }

    const blocks = await getPostBlocks(post.id)

    return {
      props: { post, blocks },
      revalidate: 3600, // 1시간마다 재생성 (ISR)
    }
  } catch (error) {
    console.error("[getStaticProps Error]", error)
    return {
      props: {},
      revalidate: 3600,
    }
  }
}

type Props = {
  post: TPost
  blocks: BlockWithChildren[]
}

const DetailPage: NextPageWithLayout<Props> = ({ post, blocks }) => {
  if (!post) return <CustomError />
  return <Detail blocks={blocks} data={post} />
}

DetailPage.getLayout = function getlayout(page) {
  const getImage = () => {
    if (page.props?.post.thumbnail) return page.props?.post.thumbnail
    if (CONFIG.ogImageGenerateURL)
      return `${CONFIG.ogImageGenerateURL}/${encodeURIComponent(
        page.props?.post.title
      )}.png`
  }

  const getMetaConfig = () => {
    if (!page.props.post) {
      return {
        title: CONFIG.blog.title,
        description: CONFIG.blog.description,
        type: "website",
        url: CONFIG.link,
      }
    }
    return {
      title: page.props.post.title || CONFIG.blog.title,
      date: new Date(
        page.props.post.date?.start_date || page.props.post.createdTime || ""
      ).toISOString(),
      image: getImage(),
      description: page.props.post.summary,
      type: page.props.post.type[0],
      url: `${CONFIG.link}/${page.props.post.slug}`,
    }
  }
  return (
    <Layout metaConfig={getMetaConfig()} fullWidth={page.props.post?.fullWidth}>
      {page}
    </Layout>
  )
}

export default DetailPage

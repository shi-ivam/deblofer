import Head from "next/head";
import jwt from "jsonwebtoken";
import user from "../models/user.js";
import Header from "../components/Header.partial";
import dbConnect from "../utils/dbConnect.js";
import fs from "fs";
import Postcard from "../components/Postcard.partial";
import post from "../models/post.js";
import { useState } from "react";
import axios from "axios";

export async function getServerSideProps(context) {
    // Default auth to false
    let auth = false;

    const tags = fs.readFileSync("./topics.json").toString();

    // Default auth to false
    await dbConnect();

    // Get new Posts and top Posts
    var newdate = new Date();

    newdate.setDate(newdate.getDate() - 30); // minus the date

    const oneMonthAgo = new Date(newdate);

    const latestPosts = JSON.stringify(
        await post
            .find({
                dateCreated: {
                    $gte: oneMonthAgo,
                },
            })
            .sort({ dateCreated: -1 })
            .limit(8)
    );

    const topPosts = JSON.stringify(
        await post.find().sort({ hearts: -1 }).limit(8)
    );
    // check token and verify valid user
    if (!context.req.headers.cookie) {
        return {
            props: {
                auth,
                tags,
                latestPosts,
                topPosts,
            },
        };
    } else {
        const db = await dbConnect();
        const jwtUser = jwt.verify(
            context.req.headers.cookie.split("=")[1],
            process.env.JWTSECRET
        );
        const foundUser = await user.findOne({ id: jwtUser.userId });
        if (foundUser) {
            console.log(foundUser);
            auth = true;
            return {
                props: { auth, tags, latestPosts, topPosts }, // Will be passed to the page component as props
            };
        } else {
            return {
                props: { auth, tags, latestPosts, topPosts }, // Will be passed to the page component as props
            };
        }
    }
}

export default (props: any) => {
    const topPosts = JSON.parse(props.topPosts);
    const latestPosts = JSON.parse(props.topPosts);
    const tags = JSON.parse(props.tags);
    const [page, setPage] = useState(0);
    const [tag, setTag] = useState("");
    const [posts, setPosts] = useState([]);
    const handleTagChange = (e) => {
        const tag = e;
        axios.get("/api/posts/" + tag).then((res) => {
            setPosts(res.data.posts);
        });
    };
    return (
        <div className="container">
            <Head>
                <title>Topics</title>
                <link rel="icon" href="/favicon.png" />
            </Head>
            <Header auth={props.auth} />
            <div className="flex">
                <div className="topics">
                    {tags.map((e) => (
                        <div className="topic">
                            <a
                                href="javascript: void(0);"
                                onClick={() => {
                                    handleTagChange(e);
                                }}
                            >
                                {e}
                            </a>
                        </div>
                    ))}
                </div>
                <div className="clear"></div>
                <div className="divider"></div>
                <div className="topPostsPosts">
                    {posts.length
                        ? posts.map((e) => (
                              <Postcard
                                  title={e.title}
                                  slug={e.slug}
                                  hearts={e.hearts}
                                  tags={e.tags}
                                  author={e.author}
                                  comments={e.comments}
                              />
                          ))
                        : [
                              ...latestPosts.map((e) => (
                                  <Postcard
                                      title={e.title}
                                      slug={e.slug}
                                      hearts={e.hearts}
                                      tags={e.tags}
                                      author={e.author}
                                      comments={e.comments}
                                  />
                              )),
                              ...topPosts.map((e) => (
                                  <Postcard
                                      title={e.title}
                                      slug={e.slug}
                                      hearts={e.hearts}
                                      tags={e.tags}
                                      author={e.author}
                                      comments={e.comments}
                                  />
                              )),
                          ]}
                </div>
                <div className="loadMore">
                    <button className="load">
                        Load More
                    </button>
                </div>
                <div className="divider"></div>
                <div className="footer">
                    <div className="main">made with {"<3"} by shivam kumar</div>
                    <div className="sec">using Nextjs, Mongodb and Node</div>
                </div>
            </div>
        </div>
    );
};

import Head from "next/head";

type PageHeaderProps = {
    title: string;
    description?: string;
};

const PageHeader: React.FC<PageHeaderProps> = (props) => {
    return (
        <Head>
            <title>{props.title}</title>
            {props.description && <meta name="description" content={props.description} />}
        </Head>
    );
};

export default PageHeader;

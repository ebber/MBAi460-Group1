#
# PhotoApp GUI — Streamlit-based interface for all API functions.
#
# Run from this directory:
#   streamlit run gui.py
#
# Requires: pip install streamlit pillow
#

import base64
import os
import tempfile

import streamlit as st
from PIL import Image
import io

import photoapp

# ── one-time initialization ──────────────────────────────────────────────────

CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'photoapp-client-config.ini')

if 'initialized' not in st.session_state:
    try:
        photoapp.initialize(CONFIG_FILE)
        st.session_state.initialized = True
        st.session_state.init_error = None
    except Exception as e:
        st.session_state.initialized = False
        st.session_state.init_error = str(e)

# ── page config ──────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="PhotoApp",
    page_icon="📸",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("📸 PhotoApp")

if not st.session_state.initialized:
    st.error(f"Failed to initialize: {st.session_state.init_error}")
    st.info("Check that `photoapp-client-config.ini` exists and the `[client] webservice` URL is set.")
    st.stop()

# ── sidebar ──────────────────────────────────────────────────────────────────

st.sidebar.header("Navigation")
page = st.sidebar.radio(
    "",
    ["Status", "Users", "Browse Images", "Upload Image", "Search by Label", "Admin"],
    label_visibility="collapsed",
)

st.sidebar.divider()
st.sidebar.caption("PhotoApp — MBAi 460 Project01 Part03")

# ── helpers ──────────────────────────────────────────────────────────────────

def show_image_from_base64(data_b64: str, caption: str = ""):
    img_bytes = base64.b64decode(data_b64)
    img = Image.open(io.BytesIO(img_bytes))
    st.image(img, caption=caption, use_container_width=True)


def get_users_dict():
    """Returns {userid: 'givenname familyname (username)'} for dropdowns."""
    users = photoapp.get_users()
    return {u[0]: f"{u[2]} {u[3]} ({u[1]})" for u in users}


# ─────────────────────────────────────────────────────────────────────────────
# PAGE: Status
# ─────────────────────────────────────────────────────────────────────────────

if page == "Status":
    st.header("Service Status")
    st.write("Pings S3 and the database to verify both are reachable.")

    if st.button("Check Connection", type="primary"):
        with st.spinner("Pinging…"):
            try:
                M, N = photoapp.get_ping()
                col1, col2 = st.columns(2)
                col1.metric("S3 Objects", M)
                col2.metric("Users in DB", N)
                st.success("Both S3 and the database are up.")
            except Exception as e:
                st.error(f"Ping failed: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: Users
# ─────────────────────────────────────────────────────────────────────────────

elif page == "Users":
    st.header("Users")

    with st.spinner("Loading users…"):
        try:
            users = photoapp.get_users()
        except Exception as e:
            st.error(f"Error: {e}")
            st.stop()

    if not users:
        st.info("No users found.")
    else:
        rows = [
            {"User ID": u[0], "Username": u[1], "Given Name": u[2], "Family Name": u[3]}
            for u in users
        ]
        st.dataframe(rows, use_container_width=True, hide_index=True)

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: Browse Images
# ─────────────────────────────────────────────────────────────────────────────

elif page == "Browse Images":
    st.header("Browse Images")

    # optional filter by user
    try:
        users_dict = get_users_dict()
    except Exception as e:
        st.error(f"Could not load users: {e}")
        st.stop()

    filter_options = {"All users": None} | {label: uid for uid, label in users_dict.items()}
    selected_label = st.selectbox("Filter by user", list(filter_options.keys()))
    filter_userid = filter_options[selected_label]

    with st.spinner("Loading images…"):
        try:
            images = photoapp.get_images(userid=filter_userid)
        except Exception as e:
            st.error(f"Error: {e}")
            st.stop()

    if not images:
        st.info("No images found.")
    else:
        st.write(f"**{len(images)} image(s) found**")

        # table view
        table_rows = [
            {"Asset ID": img[0], "User ID": img[1], "Filename": img[2], "Bucket Key": img[3]}
            for img in images
        ]
        st.dataframe(table_rows, use_container_width=True, hide_index=True)

        st.divider()
        st.subheader("View an Image")

        asset_ids = [img[0] for img in images]
        selected_assetid = st.selectbox("Select Asset ID to view", asset_ids)

        col_download, col_labels = st.columns(2)

        with col_download:
            if st.button("Download & Display", type="primary"):
                with st.spinner("Downloading from S3…"):
                    try:
                        url = photoapp.WEB_SERVICE_URL + f"/image/{selected_assetid}"
                        import requests as _req
                        resp = _req.get(url)
                        if resp.status_code == 200:
                            body = resp.json()
                            show_image_from_base64(body['data'], caption=body['localname'])
                            # offer download
                            img_bytes = base64.b64decode(body['data'])
                            st.download_button(
                                "Save to disk",
                                data=img_bytes,
                                file_name=body['localname'],
                                mime="image/jpeg",
                            )
                        else:
                            st.error(f"Server returned {resp.status_code}")
                    except Exception as e:
                        st.error(f"Error: {e}")

        with col_labels:
            if st.button("Show Labels"):
                with st.spinner("Fetching labels…"):
                    try:
                        labels = photoapp.get_image_labels(selected_assetid)
                        if not labels:
                            st.info("No labels stored for this image.")
                        else:
                            label_rows = [{"Label": l[0], "Confidence (%)": l[1]} for l in labels]
                            st.dataframe(label_rows, use_container_width=True, hide_index=True)
                    except ValueError as e:
                        st.error(str(e))
                    except Exception as e:
                        st.error(f"Error: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: Upload Image
# ─────────────────────────────────────────────────────────────────────────────

elif page == "Upload Image":
    st.header("Upload Image")

    try:
        users_dict = get_users_dict()
    except Exception as e:
        st.error(f"Could not load users: {e}")
        st.stop()

    selected_user_label = st.selectbox("Upload as user", list(users_dict.values()))
    userid = [uid for uid, label in users_dict.items() if label == selected_user_label][0]

    uploaded_file = st.file_uploader("Choose an image", type=["jpg", "jpeg", "png", "gif", "bmp"])

    if uploaded_file is not None:
        st.image(uploaded_file, caption="Preview", width=300)

        if st.button("Upload to PhotoApp", type="primary"):
            with st.spinner("Uploading and running Rekognition…"):
                try:
                    # write to a temp file so photoapp.post_image can read it
                    suffix = os.path.splitext(uploaded_file.name)[1] or '.jpg'
                    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                        tmp.write(uploaded_file.read())
                        tmp_path = tmp.name

                    # patch the basename so the DB stores the original filename
                    original_name = uploaded_file.name
                    os.rename(tmp_path, os.path.join(os.path.dirname(tmp_path), original_name))
                    final_path = os.path.join(os.path.dirname(tmp_path), original_name)

                    assetid = photoapp.post_image(userid, final_path)
                    os.remove(final_path)

                    st.success(f"Uploaded successfully! Asset ID: **{assetid}**")

                    # show labels
                    with st.spinner("Fetching Rekognition labels…"):
                        try:
                            labels = photoapp.get_image_labels(assetid)
                            if labels:
                                st.write("**Detected Labels:**")
                                label_rows = [{"Label": l[0], "Confidence (%)": l[1]} for l in labels]
                                st.dataframe(label_rows, use_container_width=True, hide_index=True)
                        except Exception:
                            pass

                except ValueError as e:
                    st.error(str(e))
                except Exception as e:
                    st.error(f"Upload failed: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: Search by Label
# ─────────────────────────────────────────────────────────────────────────────

elif page == "Search by Label":
    st.header("Search by Label")
    st.write("Find images that contain a given Rekognition label. Partial matches work (e.g. 'boat' finds 'Sailboat').")

    label_query = st.text_input("Label to search for", placeholder="e.g. dog, cloud, boat")

    if st.button("Search", type="primary") and label_query.strip():
        with st.spinner("Searching…"):
            try:
                results = photoapp.get_images_with_label(label_query.strip())
            except Exception as e:
                st.error(f"Error: {e}")
                st.stop()

        if not results:
            st.info(f"No images found with label matching '{label_query}'.")
        else:
            st.write(f"**{len(results)} result(s)**")
            result_rows = [
                {"Asset ID": r[0], "Label": r[1], "Confidence (%)": r[2]}
                for r in results
            ]
            st.dataframe(result_rows, use_container_width=True, hide_index=True)

            # view a specific result
            st.divider()
            result_asset_ids = sorted(set(r[0] for r in results))
            selected = st.selectbox("View an image from results", result_asset_ids)
            if st.button("Display Image"):
                with st.spinner("Downloading…"):
                    try:
                        import requests as _req
                        resp = _req.get(photoapp.WEB_SERVICE_URL + f"/image/{selected}")
                        if resp.status_code == 200:
                            body = resp.json()
                            show_image_from_base64(body['data'], caption=body['localname'])
                        else:
                            st.error(f"Server returned {resp.status_code}")
                    except Exception as e:
                        st.error(f"Error: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# PAGE: Admin
# ─────────────────────────────────────────────────────────────────────────────

elif page == "Admin":
    st.header("Admin")
    st.warning("Danger zone — these actions cannot be undone.")

    st.subheader("Delete All Images")
    st.write("Removes every image from S3 and clears all records from the database.")

    confirm = st.checkbox("I understand this will permanently delete all images")

    if st.button("Delete All Images", type="primary", disabled=not confirm):
        with st.spinner("Deleting…"):
            try:
                photoapp.delete_images()
                st.success("All images and labels have been deleted.")
            except Exception as e:
                st.error(f"Error: {e}")

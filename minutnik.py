import sys, glob, os, time, pandas as pd

max_buf_len = 50 * 1024
all_keywords = ['nb:', 'error', 'exception']
max_kw_len = max(map(len, all_keywords))

# we need to rescan last bytes of the file before offset
# since some partial keyword may be left there undetected.
# longest keyword will determine how many bytes before given *offset*
# we should read. Then for each keyword will adjust starting point to
# look for keyword since length differences.
# E.g. we had to read 8 bytes before offset due to keyword 'exception'
# then we need to start with 4 bytes buffer offset for keyword 'error'
#
# Mkw_adj_offset -- starting point of buf being read
# kw_adj_offset -- offset required for given keyword
# starting location for keyword scan: kw_adj_offset - Mkw_adj_offset
#
def tail_file_events(fn, begin_offset, file_size):
    found = False
    with open(fn, "rb") as fd:
        offset = begin_offset

        while offset < file_size:
            Mkw_adj_offset = max(0, offset - (max_kw_len - 1))
            fd.seek(Mkw_adj_offset, os.SEEK_SET)
            buf = fd.read(max_buf_len).lower()
            attained_offset = fd.tell()
            
            for keyword in all_keywords:
                kw_adj_offset = max(0, offset - (len(keyword) - 1))
                buf_offset = kw_adj_offset - Mkw_adj_offset
                if keyword in buf[buf_offset:]:
                    found = True
                    break

            offset = attained_offset

    return found

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print >>sys.stderr, "Usage: python %s <log-dir>" % sys.argv[0]
        sys.exit(2)
    dir_ = os.path.expanduser(sys.argv[1])
    dir_glob_mask = os.path.join(dir_, "*.log")
    dir_listing_fn = os.path.join(dir_, "listing.csv")
    max_fsz_growth_speed = 30 * 1024
    now = time.time()

    old_f_listing = pd.read_csv(dir_listing_fn).set_index("fname") if os.path.exists(dir_listing_fn) else None
    files = glob.glob(dir_glob_mask)

    events = {}
    f_listing = []
    if isinstance(old_f_listing, type(None)):
        events[None] = "listing file created: " + dir_listing_fn

    for file_ in files:
        st = os.stat(file_)
        fsize = st.st_size
        fmtime = int(st.st_mtime)
        f_listing.append((file_, fsize, fmtime))
        del st

        if isinstance(old_f_listing, type(None)):
            continue

        if not file_ in old_f_listing.index:
            found = tail_file_events(file_, 0, fsize)
            if found: events[file_] = "something interesting found"
        else:
            old_size = old_f_listing.loc[file_, 'fsize']
            old_mtime = old_f_listing.loc[file_, 'fmtime']
            if fsize == old_size:
                if fmtime == old_mtime:
                    pass
                else:
                    events[file_] = "no size change but mtime changed"
            else:
                if fsize < old_size:
                    events[file_] = "file shrinks"
                else:
                    if now != old_mtime and (fsize - old_size) / (now - old_mtime) > max_fsz_growth_speed:
                        events[file_] = "file grows too fast"
                    else:
                        found = tail_file_events(file_, old_size, fsize)
                        if found: events[file_] = "something interesting found"

    if len(events):
        for file_, event_desc in events.items():
            print file_, ":", event_desc

    pd.DataFrame.from_records(f_listing, columns = ['fname', 'fsize', 'fmtime']).to_csv(dir_listing_fn, index = False)
    sys.exit(0)
    
        
